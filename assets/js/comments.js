const gomments = {
  baseURL: `${window.siteConfig.apiURL}/gomments`,
  article: btoa(window.articleConfig.slug),
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
    --body-text-color: #2f3542;
    --body-text-color-muted: #747d8c;
    --body-background: #f1f2f6;
    --body-background-alt: #dfe4ea;

    /* Dark */
    --body-text-color-dark: #f1f2f6;
    --body-text-color-muted-dark: #ced6e0;
    --body-background-dark: #121212;
    --body-background-dark-alt: #2f3542;
    --body-background-dark-alt-1: #57606f;
  }
  `,
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
            font-variant: all-small-caps;
            font-size: 1.4rem;
            margin-bottom: 4px;
            font-weight: bold;
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
            font-size: 1.2rem;
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
            background-color: #4CAF50;
            color: white;
            padding: 12px 60px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-right: 0;
            margin-left: auto;
            font-family: 'Manrope';
            font-variant: all-small-caps;
            font-weight: bold;
            font-size: 1.4rem;
        }

        .submit-btn:hover {
            background-color: #45a049;
        }

        .submit-btn:disabled {
            background-color: grey;
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
    </style>
    <form id="gomments-reply-form" method="post">
        <div class="row">
            <div class="field-group">
                <label id="gomments-input-name-label" class="field-label" for="name"></label>
                <input type="text" id="gomments-input-name" name="name" placeholder="(optional, max 40 chars)">
            </div>
            <div class="field-group">
                <label id="gomments-input-secret-label" class="field-label" for="secret"></label>
                <input type="password" id="gomments-input-secret" name="secret" placeholder="(optional, 10 - 40 chars, for ID)">
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
    const inputSecret = this.shadowRoot.querySelector('#gomments-input-secret');
    const labelName = this.shadowRoot.querySelector('#gomments-input-name-label');
    const labelSecret = this.shadowRoot.querySelector('#gomments-input-secret-label');
    const labelBody = this.shadowRoot.querySelector('#gomments-input-body-label');
    const submitButton = this.shadowRoot.querySelector('.submit-btn');

    // Function to check if textarea has content and update button state
    const updateSubmitButtonState = () => {
      const l = textarea.value.trim().length;
      submitButton.disabled =
        l <= 0 ||
        l > 500 ||
        inputName.value.length > 40 ||
        ((inputSecret.value.length > 40 || inputSecret.value.length < 10) && inputSecret.value.length != 0);
    };

    const setLabelName = () => {
      const s = inputName.value.length > 40 ? "max 40 chars" : "";
      labelName.innerHTML = `Name <span style="color: crimson">${s}</span>`;
      inputName.className = inputName.value.length > 40 ? "validation-error" : "";
    }

    const setLabelSecret = () => {
      const s = (inputSecret.value.length > 40 || inputSecret.value.length < 10) && inputSecret.value.length != 0 ? "10 – 40 chars" : "";
      labelSecret.innerHTML = `Secret <span style="color: crimson">${s}</span>`;
      inputSecret.className = (inputSecret.value.length > 40 || inputSecret.value.length < 10) && inputSecret.value.length != 0 ? "validation-error" : "";
    }

    const setLabelBody = () => {
      const s = textarea.value.length > 500 ? "max 500 chars" : "";
      labelBody.innerHTML = `Message <span style="color: crimson">${s}</span>`;
      textarea.className = textarea.value.length > 500 ? "validation-error" : "";
    }

    setLabelName();
    setLabelSecret();
    setLabelBody();
    updateSubmitButtonState();

    textarea.addEventListener('input', updateSubmitButtonState);
    inputName.addEventListener('input', setLabelName);
    inputSecret.addEventListener('input', setLabelSecret);
    textarea.addEventListener('input', setLabelBody);
    inputName.addEventListener('input', updateSubmitButtonState);
    inputSecret.addEventListener('input', updateSubmitButtonState);
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

        try {
            const response = await fetch(`${gomments.baseURL}/articles/${gomments.article}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  reply_author_name: data.name,
                  reply_signature_secret: data.secret,
                  reply_body: data.body,
                  reply_idempotency_key: gomments.nextIdempotencyKey,
                })
            });

            if (response.ok) {
              resetTextArea();
              gomments.nextIdempotencyKey = gomments.uuid4();
              const r = await response.json()
              await reloadThread();
              location.assign(`#reply-${r.reply.reply_id}-container`);
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
  static observedAttributes = ["reply-id", "reply-author-name", "reply-signature", "reply-body"];

  constructor() {
    super();
  }

  render() {
    const createdAt = new Date(this.getAttribute("reply-created-at"));
    const signature = this.getAttribute("reply-signature") || "";
    this.shadowRoot.innerHTML = `
    <style>
      ${gomments.styleColors}

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

      .has-padding {
        padding: 1.4rem;
      }

      .rounded {
        border-radius: 6px;
      }

      .italic {
        font-style: italic;
      }

      .has-background {
        background-color: #ffffff;
      }

      .text-muted {
        color: var(--body-text-color-muted);
      }

      .text-normal {
        color: var(--body-text-color);
      }

      @media (prefers-color-scheme: dark) {
        .has-background {
          background-color: var(--body-background-dark-alt);
        }
        .text-muted {
          color: var(--body-text-color-muted-dark);
        }

        .thick-border-top {
          border-top: solid 1px var(--body-text-color-muted-dark);
        }
      }

      .heading-font {
        font-family: 'Manrope';
      }

      .small-font {
        font-size: 1.4rem;
      }

      .body-font {
        font-family: quattrocento;
      }

      .thick-border-top {
        border-top: solid 1px var(--body-text-color-muted);
        padding-top: 1.4rem;
      }
    </style>
    <div class="has-padding small-font has-margin-bottom-m rounded has-background">
      <div class="has-margin-bottom-m">
        <span class="heading-font has-font-weight-bold">${this.getAttribute("reply-author-name")}</span>
        <span class="heading-font">${signature !== "" ? "(" + signature.slice(-8) + ")" : ""}</span>
      </div>
      <div class="has-margin-bottom-m body-font">
        ${this.getAttribute("reply-body")}
      </div>
      <div class="italic text-muted body-font thick-border-top">
        <span>#${this.getAttribute("reply-id")} ${createdAt.toLocaleString()}</span>
      </div>
    </div>
    `;
  }
}

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
          font-variant: all-small-caps;
          text-align: center;
          font-weight: bold;
          font-size: 1.4rem;
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
          font-variant: all-small-caps;
          text-align: center;
          font-weight: bold;
          font-size: 1.4rem;
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
  thread.innerHTML = `<gomments-loading-fill></gomments-loading-fill>`;

  await new Promise(resolve => setTimeout(() => {resolve();}, 500));

  try {
    await fetch(`${gomments.baseURL}/articles/${gomments.article}/replies`)
      .then(r => r.json())
      .then(r => {
        const thread = document.getElementById("comments-thread");
        thread.innerHTML = "";

        for (const respReply of r.replies) {
          const reply = document.createElement("gomments-reply");
          reply.setAttribute("id", `reply-${respReply.reply_id || 0}-container`);
          reply.setAttribute("reply-id", respReply.reply_id);
          reply.setAttribute("reply-signature", respReply.reply_signature);
          reply.setAttribute("reply-body", respReply.reply_body);
          reply.setAttribute("reply-created-at", respReply.reply_created_at);
          reply.setAttribute("reply-author-name", respReply.reply_author_name);

          thread.appendChild(reply);
        }
      });
  } catch (e) {
    thread.innerHTML = "<gomments-error-fill />";
  }
}

addEventListener("load", (_event) => {
  console.log("gomments");

  gomments.nextIdempotencyKey = gomments.uuid4();

  const replyForm = document.getElementById("comments-form");
  replyForm.innerHTML = "<gomments-reply-submission-form />";

  reloadThread();
});
