import { timeAgoExact, getTripColorClass } from './utils';

export default function Reply({
  id,
  authorName,
  signature,
  body,
  createdAt,
  isAttention,
}) {
  const date = new Date(createdAt);
  const tripColorClass = getTripColorClass(signature || '');
  const tripcodeDisplay =
    signature && signature !== '' ? `#${signature.slice(0, 15)}` : '';

  return (
    <div
      className={`reply-card ${tripColorClass} ${isAttention ? 'attention' : ''}`}
      title={`ID: ${id}, ${timeAgoExact(date)} at ${date.toLocaleString()}`}
    >
      <div className="reply-card-heading-lockup">
        <div className={`name-pill`}>{authorName}</div>
        <div className="reply-created-at">{timeAgoExact(date).toLowerCase()}</div>
      </div>
      <div className="reply-card-body">{body}</div>
    </div>
  );
}
