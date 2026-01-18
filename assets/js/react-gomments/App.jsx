import { useState, useEffect, useCallback } from 'react';
import { uuid4 } from './utils';
import ReplyForm from './ReplyForm';
import ReplyFeed from './ReplyFeed';

const baseURL = `${window.siteConfig.apiURL}/gomments`;
const article = btoa(window.articleConfig.articleID);

export default function App() {
  const [replies, setReplies] = useState([]);
  const [replyCount, setReplyCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attentionReplyId, setAttentionReplyId] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => uuid4());

  const loadReplies = useCallback(async () => {
    setError(false);

    try {
      const [statsRes, repliesRes] = await Promise.all([
        fetch(`${baseURL}/articles/replies/stats?article=${article}`),
        fetch(`${baseURL}/articles/${article}/replies`),
      ]);

      const statsData = await statsRes.json();
      const repliesData = await repliesRes.json();

      setReplyCount(statsData.stats[article].count);
      setReplies(repliesData.replies);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load comments:', e);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReplies();
  }, [loadReplies]);

  const handleSubmitReply = async ({ name, secret, body }) => {
    try {
      const response = await fetch(`${baseURL}/articles/${article}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author_name: name ?? '',
          signature_secret: secret ?? '',
          body: body,
          idempotency_key: idempotencyKey,
        }),
      });

      if (response.ok) {
        setIdempotencyKey(uuid4());
        const r = await response.json();
        setAttentionReplyId(`${r.reply.id}`);
        await loadReplies();
        return true;
      } else {
        console.error('Error:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Network error:', error);
      return false;
    }
  };

  return (
    <div className="gomments-container">
      <ReplyForm onSubmit={handleSubmitReply} />
      <ReplyFeed
        replies={replies}
        replyCount={replyCount}
        loading={loading}
        error={error}
        attentionReplyId={attentionReplyId}
      />
    </div>
  );
}
