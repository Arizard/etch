export default function SubmitReplyButton({ disabled }) {
  return (
    <button className="submit-btn" type="submit" disabled={disabled} data-umami-event="Submit Reply" data-umami-event-button-disabled={disabled}>
      Submit Reply
    </button>
  );
}
