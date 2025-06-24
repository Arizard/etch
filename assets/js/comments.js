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
        .row {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }

        .row input {
            flex: 1;
        }

        textarea {
            width: 100%;
            box-sizing: border-box;
            font-family: Inconsolata;
        }

        input[type="text"],
        input[type="password"],
        textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
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
            font-size: 16px;
            margin-right: 0;
            margin-left: auto;
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
        }

        form {
          margin-bottom: 30px;
        }
    </style>
    <form id="gomments-reply-form" method="post">
        <div class="row">
            <input type="text" name="name" placeholder="Name (optional, max 40 chars)">
            <input type="password" name="secret" placeholder="Secret (optional, 10 - 40 chars)">
        </div>
        <div class="row">
            <textarea id="gomments-reply-form-body" name="body" placeholder="Type your message here (max 500 characters)"></textarea>
        </div>
        <div class="row">
            <button class="submit-btn" type="submit">Submit Reply</button>
        </div>
    </form>
    `;

    const textarea = this.shadowRoot.querySelector('#gomments-reply-form-body');
    const submitButton = this.shadowRoot.querySelector('.submit-btn');

    // Function to check if textarea has content and update button state
    const updateSubmitButtonState = () => {
        const hasContent = textarea.value.trim().length > 0;
        submitButton.disabled = !hasContent;
    };

    // Initial check
    updateSubmitButtonState();

    // Listen for input changes in the textarea
    textarea.addEventListener('input', updateSubmitButtonState);

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
              const r = await response.json()
              location.assign(`#comments-container`);
              location.reload();
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

  render() {
    const createdAt = new Date(this.getAttribute("reply-created-at"));
    const signature = this.getAttribute("reply-signature") || "";
    this.shadowRoot.innerHTML = `
    <style>
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
    </style>
      <div class="has-padding has-margin-bottom-m has-border rounded">
        <div class="italic has-margin-bottom-m">
          <span>[#${this.getAttribute("reply-id")}] </span>
          <span class="has-font-weight-bold">${this.getAttribute("reply-author-name")}</span>
          <span>${signature !== "" ? "(" + signature.slice(-8) + ")" : ""}</span>
          <span>said at ${createdAt.toLocaleString()}</span>
        </div>
        <div>
          ${this.getAttribute("reply-body")}
        </div>
      </div>
    `;
  }
}

customElements.define("gomments-reply", ReplyComponent);

addEventListener("load", (_event) => {
  console.log("gomments");

  gomments.nextIdempotencyKey = gomments.uuid4();

  const replyForm = document.getElementById("comments-form");
  replyForm.innerHTML = "<gomments-reply-submission-form />";

  fetch(`${gomments.baseURL}/articles/${gomments.article}/replies`)
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
});
