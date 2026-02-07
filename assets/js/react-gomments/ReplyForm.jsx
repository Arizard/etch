import { useState, useCallback } from 'react';
import NameInput from './NameInput';
import MessageInput from './MessageInput';
import SubmitReplyButton from './SubmitReplyButton';

export default function ReplyForm({ onSubmit }) {
  const [nameValue, setNameValue] = useState('');
  const [bodyValue, setBodyValue] = useState('');
  const [expanded, setExpanded] = useState(false);

  const charLimit = 500

  isValidBody = (bodyValue) => (
    bodyValue.trim().length <= charLimit &&
    bodyValue.trim().length > 0
  );

  isValidName = (nameValue) => {
    const [name, secret] = nameValue.split('#');
    return (name ?? '').trim().length <= 24 &&
    (secret ?? '').trim().length <= 8;;
  };

  const isValid = isValidName(nameValue) && isValidBody(bodyValue);

  const handleNameChange = (value) => {
    if (!isValidName(value)) return;
    setNameValue(value);
  };

  const handleBodyChange = (value) => {
    setBodyValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const [name, secret] = nameValue.split('#');
    const success = await onSubmit({
      name: name ?? '',
      secret: secret ?? '',
      body: bodyValue,
    });

    if (success) {
      setBodyValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    {expanded && <><div className="row">
        <NameInput
          value={nameValue}
          onChange={handleNameChange}
          error={''}
        />
      </div><div className="hr"></div></>}
      <div className="row">
        <MessageInput
          value={bodyValue}
          focused={expanded}
          onFocus={() => setExpanded(true)}
          onChange={handleBodyChange}
          error={''}
        />
      </div>
    {expanded && <div className="row reply-form-submit-row">
      <div className={bodyValue.length > charLimit ? 'char-count-text validation-error-text' : 'char-count-text'}>{bodyValue.length}{'/'}{charLimit}</div>
        <SubmitReplyButton disabled={!isValid} />
      </div>
    }
      </form>
  );
}
