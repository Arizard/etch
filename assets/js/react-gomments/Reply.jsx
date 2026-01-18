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
      className={`reply-card ${isAttention ? 'attention' : ''}`}
      title={`ID: ${id}, ${timeAgoExact(date)} at ${date.toLocaleString()}`}
    >
      <div className="reply-card-heading-lockup">
        <span className={`name-pill ${tripColorClass}`}>
          {authorName} {tripcodeDisplay && <span className="tripcode">{tripcodeDisplay}</span>}
        </span>
        <span className="reply-created-at">{timeAgoExact(date).toUpperCase()}</span>
      </div>
      <div className="reply-card-body">{body}</div>
    </div>
  );
}
