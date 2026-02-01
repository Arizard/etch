export default function MessageInput({ value, onChange, focused, onFocus, error }) {
  return (
    <div className="field-group">
      <textarea
        id="gomments-reply-form-body"
        name="body"
        placeholder="add a reply..."
    rows={focused ? 6 : 1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'validation-error' : undefined}
        onFocus={onFocus}
      />
    </div>
  );
}
