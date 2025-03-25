class IYComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
  
    static define(tag, { html = "", css = "", attr = {}, methods = {}, pre = null, post = null } = {}) {
      class CustomComponent extends IYComponent {
        constructor() {
          super();
          this.template = { html, css, attr, methods, pre, post };
  
          if (this.template.pre) this.template.pre.call(this);
          this.render();
        }
  
        render() {
          let dynamicHtml = this.template.html;
  
          // Sustituir variables {{var}}
          Object.entries(this.template.attr).forEach(([key, value]) => {
            dynamicHtml = dynamicHtml.replace(`{{${key}}}`, this.getAttribute(key) || value);
          });
  
          this.shadowRoot.innerHTML = `
            <style>${this.template.css}</style>
            ${dynamicHtml}
            <slot></slot>
          `;
  
          // Vincular métodos dinámicos
          Object.entries(this.template.methods).forEach(([name, func]) => {
            this[name] = func.bind(this);
          });
  
          if (this.template.post) this.template.post.call(this);
        }
      }
  
      customElements.define(tag, CustomComponent);
      return CustomComponent;
    }
  
    static extend(baseTag, newTag, { css = "", html = "", attr = {}, methods = {}, pre = null, post = null } = {}) {
      if (!customElements.get(baseTag)) {
        throw new Error(`El componente base "${baseTag}" no está definido.`);
      }
  
      class ExtendedComponent extends customElements.get(baseTag) {
        constructor() {
          super();
          this.template.css += css; // Hereda el CSS y agrega nuevo
          this.template.html = html || this.template.html;
          this.template.attr = { ...this.template.attr, ...attr };
          this.template.methods = { ...this.template.methods, ...methods };
          if (pre) this.template.pre = pre;
          if (post) this.template.post = post;
  
          if (this.template.pre) this.template.pre.call(this);
          this.render();
        }
      }
  
      customElements.define(newTag, ExtendedComponent);
      return ExtendedComponent;
    }
  }
  
