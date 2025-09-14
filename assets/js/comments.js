const gomments = {
  baseURL: `${window.siteConfig.apiURL}/gomments`,
  article: btoa(window.articleConfig.articleID),
  uuid4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
  },
  nextIdempotencyKey: null,
  styleColors: `
  :host {
    --accent-color: #ff4757;
    --accent-color-light: #ff6b81;

    --body-text-color: #000000;
    --body-text-color-muted: #747d8c;
    --body-background: #f1f2eb;
    --body-background-alt: #d8dad3;
    --body-background-alt-1: #ffffff;
    --secondary-color: #566246;

    /* Dark */
    --body-text-color-dark: #ffffff;
    --body-text-color-muted-dark: #ced6e0;
    --body-background-dark: #002029; //#0f172a;
    --body-background-dark-alt: #00303d; //#1e293b;
    --body-background-dark-alt-1: #004052;
    --secondary-color-dark: #9fffcb; //#80FFDB;
  }
  `,
  attentionReplyID: "",
}

window.gomments = gomments;

class ReactiveRenderingHTMLElement extends HTMLElement {
  static observedAttributes = [];
  render() {
    throw new Error("render must be implemented");
  }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});
    this.render();
  }

  attributeChangedCallback(_name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    this.render();
  }
}

class ReplySubmissionFormComponent extends ReactiveRenderingHTMLElement {
  static observedAttributes = [];

  constructor() {
    super();

    this.render();
  }

  async render() {
    this.shadowRoot.innerHTML = `
    <style>
        ${gomments.styleColors}

        .row {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }

        .row input {
            flex: 1;
        }

        .field-group {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .field-label {
            font-family: 'Manrope';
            font-size: 1.12rem;
            margin-bottom: 6px;
            font-weight: 800;
            line-height: 1.12rem;
        }

        textarea {
            width: 100%;
            box-sizing: border-box;
            font-family: Inconsolata;
        }

        input[type="text"],
        input[type="password"],
        textarea {
            font-family: Inconsolata;
            font-size: 1.4rem;
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
        }

        .validation-error {
          border: 2px dashed crimson !important;
        }

        input[type="text"]:focus,
        input[type="password"]:focus,
        textarea:focus {
            outline: none;
        }

        .submit-btn {
            background-color: #6ab04c;
            color: white;
            padding: 12px 60px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-right: auto;
            margin-left: auto;
            font-family: 'Manrope';
            text-transform: uppercase;
            font-weight: bold;
            font-size: 1.12rem;
        }

        .submit-btn:hover {
            background-color: #77c157;
        }

        .submit-btn:disabled {
            background-color: #57606f;
        }

        @media (max-width: 770px) {
            .submit-btn {
                width: 100%;
                margin-left: 0;
            }

            .row {
                display: block;
                margin-bottom: 0;
            }

            .field-group {
                margin-bottom: 10px;
            }

            input[type=text],
            input[type=password],
            textarea {
                margin-bottom: 0;
            }
        }

        form {
            margin-bottom: 30px;
        }

        @media (prefers-color-scheme: dark) {
          input[type="text"],
          input[type="password"],
          textarea {
              border: 2px solid #57606f;
              background-color: var(--body-background-dark-alt);
              color: white;
          }
        }
    </style>
    <form id="gomments-reply-form" method="post">
        <div class="row">
            <div class="field-group">
                <label id="gomments-input-name-label" class="field-label" for="name"></label>
                <input type="text" id="gomments-input-name" name="name" placeholder="(optional)">
            </div>
        </div>
        <div class="row">
            <div class="field-group">
                <label id="gomments-input-body-label" class="field-label" for="gomments-reply-form-body"></label>
                <textarea
                  id="gomments-reply-form-body"
                  name="body"
                  placeholder="(max 500 characters)"
                  rows=6
                ></textarea>
            </div>
        </div>
        <div class="row">
            <button class="submit-btn" type="submit">Submit Reply</button>
        </div>
    </form>
    `;

    const textarea = this.shadowRoot.querySelector('#gomments-reply-form-body');
    const inputName = this.shadowRoot.querySelector('#gomments-input-name');
    const labelName = this.shadowRoot.querySelector('#gomments-input-name-label');
    const labelBody = this.shadowRoot.querySelector('#gomments-input-body-label');
    const submitButton = this.shadowRoot.querySelector('.submit-btn');

    // Function to check if textarea has content and update button state
    const updateSubmitButtonState = () => {
      const l = textarea.value.trim().length;
      submitButton.disabled =
        l == 0 ||
        getBodyValidationError() != "" ||
        getNameValidationError() != "";
    };

    const getNameValidationError = () => {
      const [name, secret] = inputName.value.split("#");
      const s = [
        name?.length > 24 ? "max name length exceeded" : "",
        secret?.length > 8 ? "max secret length exceeded": "",
      ].filter(s => s != "").join(", ");

      return s;
    }

    const setLabelName = () => {
      const s = getNameValidationError();

      labelName.innerHTML = `Name <span style="color: crimson">${s}</span>`.toUpperCase();
      inputName.className = s != "" ? "validation-error" : "";
    }

    const getBodyValidationError = () => {
      return textarea.value.length > 500 ? "max length exceeded" : "";
    }

    const setLabelBody = () => {
      const s = getBodyValidationError();

      labelBody.innerHTML = `Message <span style="color: crimson">${s}</span>`.toUpperCase();
      textarea.className = s != "" ? "validation-error" : "";
    }

    setLabelName();
    setLabelBody();
    updateSubmitButtonState();

    textarea.addEventListener('input', updateSubmitButtonState);
    inputName.addEventListener('input', setLabelName);
    textarea.addEventListener('input', setLabelBody);
    inputName.addEventListener('input', updateSubmitButtonState);
    textarea.addEventListener('input', updateSubmitButtonState);

    const resetTextArea = () => {
      textarea.value = "";
      submitButton.disabled = true;
    }

    this.shadowRoot.querySelector('#gomments-reply-form').addEventListener('submit', async function(e) {
      e.preventDefault(); // Stop normal form submission

      // Get form data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      const [name, secret] = data.name.split("#");

      try {
          const response = await fetch(`${gomments.baseURL}/articles/${gomments.article}/replies`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reply_author_name: name ?? "",
                reply_signature_secret: secret ?? "",
                reply_body: data.body,
                reply_idempotency_key: gomments.nextIdempotencyKey,
              })
          });

          if (response.ok) {
            resetTextArea();
            gomments.nextIdempotencyKey = gomments.uuid4();
            const r = await response.json()
            gomments.attentionReplyID = `${r.reply.reply_id}`;
            await reloadThread();
          } else {
            console.error('Error:', response.status);
          }
      } catch (error) {
          console.error('Network error:', error);
      }
    });
  }
}
customElements.define("gomments-reply-submission-form", ReplySubmissionFormComponent);

class ReplyComponent extends ReactiveRenderingHTMLElement {
  static observedAttributes = ["reply-id", "reply-author-name", "reply-signature", "reply-body", "reply-created-at"];

  constructor() {
    super();
  }

  getTripColorClass(str) {
    if (str == "") {
      return `tripcode-color-anon`;
    }

    let hash = 0;
    let power = 1;
    for (let i = 0; i < str.length; i++) {
      hash += str.charCodeAt(i) * power;
      power *= 37;
    }
    return `tripcode-color-${(hash % 24).toString()}`;
  }

  render() {
    const createdAt = new Date(this.getAttribute("reply-created-at"));
    const signature = this.getAttribute("reply-signature") || "";

    const tripcodeHTML = signature != "" ? `<span class="tripcode">#${signature.slice(0,15)}</span>` : "";

    this.shadowRoot.innerHTML = `
    <style>
      ${gomments.styleColors}

      /* Light mode tripcode colors - pastels */
      .tripcode-color-anon {
        background: #eee;
      }
      .tripcode-color-0 {
        background: #c8f7c5;
      }

      .tripcode-color-1 {
        background: #ffb3d9;
      }

      .tripcode-color-2 {
        background: #ffe4b5;
      }

      .tripcode-color-3 {
        background: #d6c9ff;
      }

      .tripcode-color-4 {
        background: #e6e6fa;
      }

      .tripcode-color-5 {
        background: #fff2cc;
      }

      .tripcode-color-6 {
        background: #ffd6cc;
      }

      .tripcode-color-7 {
        background: #ffcccb;
      }

      .tripcode-color-8 {
        background: #bfdbfe;
      }

      .tripcode-color-9 {
        background: #ccf2f4;
      }

      .tripcode-color-10 {
        background: #f0c4e8;
      }

      .tripcode-color-11 {
        background: #f4d1ae;
      }

      .tripcode-color-12 {
        background: #e8f5e8;
      }

      .tripcode-color-13 {
        background: #fce4ec;
      }

      .tripcode-color-14 {
        background: #fff8e1;
      }

      .tripcode-color-15 {
        background: #f3e5f5;
      }

      .tripcode-color-16 {
        background: #e1f5fe;
      }

      .tripcode-color-17 {
        background: #f1f8e9;
      }

      .tripcode-color-18 {
        background: #fdf2e9;
      }

      .tripcode-color-19 {
        background: #fce4ec;
      }

      .tripcode-color-20 {
        background: #e8eaf6;
      }

      .tripcode-color-21 {
        background: #e0f2f1;
      }

      .tripcode-color-22 {
        background: #fff3e0;
      }

      .tripcode-color-23 {
        background: #f9fbe7;
      }
      @media (prefers-color-scheme: dark) {
        /* Dark mode tripcode colors - jewel tones */
        .tripcode-color-anon {
          background: #333;
        }

        .tripcode-color-0 {
          background: #2d8659;
        }

        .tripcode-color-1 {
          background: #b83280;
        }

        .tripcode-color-2 {
          background: #d68910;
        }

        .tripcode-color-3 {
          background: #7d3c98;
        }

        .tripcode-color-4 {
          background: #5b2c6f;
        }

        .tripcode-color-5 {
          background: #b7950b;
        }

        .tripcode-color-6 {
          background: #ca6f1e;
        }

        .tripcode-color-7 {
          background: #c0392b;
        }

        .tripcode-color-8 {
          background: #2e86ab;
        }

        .tripcode-color-9 {
          background: #138d75;
        }

        .tripcode-color-10 {
          background: #a93226;
        }

        .tripcode-color-11 {
          background: #784212;
        }

        .tripcode-color-12 {
          background: #1b4332;
        }

        .tripcode-color-13 {
          background: #8e2454;
        }

        .tripcode-color-14 {
          background: #9c6644;
        }

        .tripcode-color-15 {
          background: #512e5f;
        }

        .tripcode-color-16 {
          background: #1565c0;
        }

        .tripcode-color-17 {
          background: #2e7d32;
        }

        .tripcode-color-18 {
          background: #bf360c;
        }

        .tripcode-color-19 {
          background: #6a1b9a;
        }

        .tripcode-color-20 {
          background: #283593;
        }

        .tripcode-color-21 {
          background: #00695c;
        }

        .tripcode-color-22 {
          background: #e65100;
        }

        .tripcode-color-23 {
          background: #827717;
        }
      }

      :host {
        font-family: inconsolata, monospace;
        line-height: 110%;
      }

      .has-font-weight-bold {
        font-weight: bold;
      }

      .has-margin-bottom-m {
        margin-bottom: 1.4rem;
      }

      .has-border {
        border-width: 1px;
        border-style: solid;
      }

      .reply-card-heading-lockup {
        display: block;
        flex-wrap: wrap;
        gap: 0;
      }

      @media (min-width: 770px) {
        .reply-card-heading-lockup {
          display: flex;
        }
      }

      .reply-card-heading-lockup-column {
        flex: 0 1 auto;
      }

      .reply-card-heading-lockup-column-left {
        flex: 1 0 auto;
        max-width: 100%;
      }

      .reply-card {
        padding: 14px 20px;
        font-size: 1.4rem;
        margin-bottom: 14px;
        border-radius: 6px;
        background-color: #ffffff;
      }

      .reply-card-timestamp {
        font-family: Manrope;
        font-size: 1rem;
        line-height: 1rem;
        margin-top: 4px;
      }

      .reply-card-body {
        margin-bottom: 6px;
      }

      .italic {
        font-style: italic;
      }

      .text-muted {
        color: var(--body-text-color-muted);
      }

      .text-normal {
        color: var(--body-text-color);
      }

      .heading-font {
        font-family: 'Manrope';
      }

      .small-font {
        font-size: 1.4rem;
      }

      .body-font {
        font-family: "Manrope", sans-serif;
      }

      .thick-border-top {
        border-top: solid 1px var(--body-text-color-muted);
        padding-top: 1.4rem;
      }

      .attention {
        border: 2px solid #45a049;
        box-sizing: border-box;
      }

      .wspr {
        white-space: pre-wrap;
        word-break: break-word;
      }

      .tripcode {
        font-family: "Inconsolata";
        font-size: 1.4rem;
        font-weight: lighter;
        letter-spacing: 0;
      }

      .name-pill {
        display: inline-block;
        margin-left: -6px;
        border-radius: 6px;
        padding: 2px 6px;
        word-wrap: break-word;
        max-width: 100%;
        font-size: 1.4rem;
      }

      .reply-created-at {
        font-size: 0.8rem;
        display: block;
        width: 100%;
        color: var(--body-text-color-muted);
        padding: 0;
        margin-top: 2px;
      }

      @media (prefers-color-scheme: dark) {
        .text-muted {
          color: var(--body-text-color-muted-dark);
        }

        .thick-border-top {
          border-top: solid 1px var(--body-text-color-muted-dark);
        }

        .reply-card {
          background-color: var(--body-background-dark-alt);
        }
        .reply-created-at {
          color: var(--body-text-color-muted-dark);
        }
      }
    </style>
    <div title="ID: ${this.getAttribute("reply-id")}, ${timeAgoExact(createdAt)} at ${createdAt.toLocaleString()}" class="${this.getAttribute("reply-id") == gomments.attentionReplyID ? "attention" : ""} reply-card">
      <div class="has-margin-bottom-m reply-card-heading-lockup">
          <span class="heading-font has-font-weight-bold name-pill ${this.getTripColorClass(signature)}">${this.getAttribute("reply-author-name")} ${tripcodeHTML}</span>
          <span class="heading-font has-font-weight-bold reply-created-at">${timeAgoExact(createdAt).toUpperCase()}</span>
      </div>
      <div class="reply-card-body body-font wspr">${this.getAttribute("reply-body")}</div>
    </div>
    `;
  }
}

// <span title="ID: ${this.getAttribute("reply-id")}, ${createdAt.toLocaleString()}">${timeAgoExact(createdAt)}</span>

customElements.define("gomments-reply", ReplyComponent);

class LoadingFill extends ReactiveRenderingHTMLElement {
  constructor() {
    super();
  }
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${gomments.styleColors}
        :host {
          font-family: 'Manrope';
          text-transform: uppercase;
          text-align: center;
          font-weight: bold;
          font-size: 1.12rem;
          width: 100%;
          color: var(--body-text-color-muted);
        }
        @media (prefers-color-scheme: dark) {
          :host {
            color: var(--body-text-color-muted-dark);
          }
        }
      </style>
      <p>Loading comments</p>
    `;
  }
}

customElements.define("gomments-loading-fill", LoadingFill);

class ErrorFill extends ReactiveRenderingHTMLElement {
  constructor() {
    super();
  }
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${gomments.styleColors}
        :host {
          font-family: 'Manrope';
          text-transform: uppercase;
          text-align: center;
          font-weight: bold;
          font-size: 1.12rem;
          width: 100%;
          color: crimson;
        }
      </style>
      <p>could not load comments</p>
    `;
  }
}

customElements.define("gomments-error-fill", ErrorFill);

async function reloadThread() {
  const thread = document.getElementById("comments-thread");
  if (!thread) {
    return;
  }
  thread.innerHTML = `<gomments-loading-fill></gomments-loading-fill>`;

  try {
    let replyCount = null;
    let replies = [];
    const fetchStats = fetch(`${gomments.baseURL}/articles/replies/stats?article=${gomments.article}`)
      .then(r => r.json())
      .then(r => {
        replyCount = r.stats[gomments.article].count;
      })
    const fetchReplies = fetch(`${gomments.baseURL}/articles/${gomments.article}/replies`)
      .then(r => r.json())
      .then(r => {
        replies = r.replies;
      });

    await Promise.all([fetchStats, fetchReplies]);

    thread.innerHTML = `<div style="font-family: Manrope; margin-bottom: 10px; font-weight: 800; font-size: 1.12rem; line-height: 1.12rem;">REPLIES (${replyCount})</div>`;

    for (const respReply of replies) {
      const reply = document.createElement("gomments-reply");
      reply.setAttribute("id", `reply-${respReply.reply_id || 0}-container`);
      reply.setAttribute("reply-id", respReply.reply_id);
      reply.setAttribute("reply-signature", respReply.reply_signature);
      reply.setAttribute("reply-body", respReply.reply_body);
      reply.setAttribute("reply-created-at", respReply.reply_created_at);
      reply.setAttribute("reply-author-name", respReply.reply_author_name);

      thread.appendChild(reply);
    }
    console.log("loaded comments");
  } catch (e) {
    thread.innerHTML = "<gomments-error-fill />";
  }
}

addEventListener("load", (_event) => {
  console.log("gomments");

  gomments.nextIdempotencyKey = gomments.uuid4();

  const replyForm = document.getElementById("comments-form");
  if (!replyForm) {
    return;
  }
  replyForm.innerHTML = "<gomments-reply-submission-form />";

  reloadThread();
});

// Alternative version that shows exactly the format you requested
function timeAgoExact(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const days = totalDays;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  const parts = [];

  if (days > 0) parts.push(`${days} days`);
  if (days == 0 && hours > 0) parts.push(`${hours} hours`);
  if (days == 0 && hours == 0 && minutes > 0) parts.push(`${minutes} minutes`);

  return parts.length > 0 ? parts.join(' ') + ' ago' : 'just now';
}
