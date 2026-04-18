import { useState, useEffect, useCallback } from 'react';
import { uuid4 } from './utils';
import ReplyForm from './ReplyForm';
import ReplyFeed from './ReplyFeed';

const baseURL = `${window.siteConfig.apiURL}/gomments`;
const article = btoa(window.articleConfig.articleID);
const likeDeletionKeyName = `article:${article}:likeDeletionKey`

export default function App() {
  const [replies, setReplies] = useState([]);
  const [replyCount, setReplyCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attentionReplyId, setAttentionReplyId] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => uuid4());

  const [reactionBarLocked, setReactionBarLocked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const handleLikeButtonOnClick = async () => {
    if (reactionBarLocked) {
      return;
    }
    setReactionBarLocked(true);
    if (liked) {
      setLiked(false);
      const deletionKey = localStorage.getItem(likeDeletionKeyName);
      if (deletionKey) {
        await fetch(`${baseURL}/reactions?key=${deletionKey}`, {
          method: 'DELETE',
        });
        localStorage.removeItem(likeDeletionKeyName);
      }
    } else {
      setLiked(true);
      const resp = await fetch(`${baseURL}/articles/${article}/reactions/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (resp.ok) {
        const { deletion_key: deletionKey } = await resp.json();
        localStorage.setItem(likeDeletionKeyName, deletionKey);
      }
    }
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
    setReactionBarLocked(false);
  }

  const load = useCallback(async () => {
    setError(false);

    try {
      // need to refactor the backend sometime and expose a single endpoint for an article.
      const [statsRes, repliesRes, reactionsRes] = await Promise.all([
        fetch(`${baseURL}/articles/replies/stats?article=${article}`),
        fetch(`${baseURL}/articles/${article}/replies`),
        fetch(`${baseURL}/articles/reactions/stats?article=${article}`),
      ]);

      const statsData = await statsRes.json();
      const repliesData = await repliesRes.json();
      const reactionsData = await reactionsRes.json();

      setReplyCount(statsData.stats[article].count);
      setReplies(repliesData.replies);

      const likeDeletionKey = localStorage.getItem(likeDeletionKeyName);
      if (likeDeletionKey) {
        setLiked(true);
      }

      setLikeCount(reactionsData.stats[article].like - (likeDeletionKey ? 1 : 0));

      setLoading(false);
    } catch (e) {
      console.error('Failed to load comments:', e);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        await load();
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
    {/* this may work better as a component */}
    <div className={reactionBarLocked ? "reaction-bar locked" : "reaction-bar"}>
    <button
      className="like-button"
      aria-pressed={liked}
      aria-label={liked ? "unlike article" : "like article"}
      onClick={handleLikeButtonOnClick}
    >
      <div>❤️</div>
    {
      liked
        ? likeCount > 0
          ? <div>Liked by <strong>you</strong> and {likeCount} readers.</div>
          : <div>Liked by <strong>you</strong>.</div>
        : likeCount > 0
          ? <div>Liked by {likeCount} readers.</div>
          :  <div>Be the first to leave a like.</div>
    }
    </button>
    </div>
    <div className="section-label">Reply</div>
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
