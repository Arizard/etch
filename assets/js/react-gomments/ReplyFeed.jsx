import Reply from './Reply';

export default function ReplyFeed({
  replies,
  replyCount,
  loading,
  error,
  attentionReplyId,
}) {
  if (loading) {
    return <div className="loading-fill">Loading comments</div>;
  }

  if (error) {
    return <div className="error-fill">could not load comments</div>;
  }

  return (
    <div className="reply-feed">
      <div className="reply-feed-header">REPLIES ({replyCount})</div>
      {replies.map((reply) => (
        <Reply
          key={reply.id}
          id={reply.id}
          authorName={reply.author_name}
          signature={reply.signature}
          body={reply.body}
          createdAt={reply.created_at}
          isAttention={`${reply.id}` === attentionReplyId}
        />
      ))}
    </div>
  );
}
