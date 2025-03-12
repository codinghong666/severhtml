

class TypedTextEffect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // 创建一个 Shadow DOM
    }

    connectedCallback() {
        const shadow = this.shadowRoot;

        // 获取传入的文本内容，默认为空数组
        const texts = this.getAttribute('texts') ? JSON.parse(this.getAttribute('texts')) : [];
        const delay = this.getAttribute('delay') || 70; // 默认为 70 毫秒
        const fontSize = this.getAttribute('font-size') || '1.5em'; // 默认为 1.5em

        const container = document.createElement('div');
        container.setAttribute('id', 'intro-container');
        shadow.appendChild(container);

        // 通用函数：逐字输出 text 到指定 element 中
        function typeText(element, text, delay, callback) {
            let index = 0;
            function type() {
                if (index < text.length) {
                    const char = text.charAt(index);
                    // 遇到换行符则插入 <br> 标签
                    element.innerHTML += (char === '\n') ? '<br>' : char;
                    index++;
                    setTimeout(type, delay);
                } else if (callback) {
                    callback();
                }
            }
            type();
        }

        // 递归函数：依次逐行输出 texts 数组中的文本内容
        function typeTextsSequentially(texts, container, delay, fontSize, currentIndex = 0, callback) {
            if (currentIndex >= texts.length) return;

            let element = document.createElement('p');
            // 使用传入的 fontSize 属性来设置字体大小
            element.style.fontSize = fontSize;
            element.style.marginBottom = "20px";
            container.appendChild(element);
            
            typeText(element, texts[currentIndex], delay, function () {
                // 当前文本输出完成后，递归调用输出下一条
                typeTextsSequentially(texts, container, delay, fontSize, currentIndex + 1, callback);
            });
        }

        // 开始逐行输出文本，设置打字延迟为 70 毫秒
        typeTextsSequentially(texts, container, delay, fontSize, 0, () => {
            // 完成后调用回调函数（如果有传入）
            if (this.callback) this.callback();
        });
    }

    // 设置回调函数
    setCallback(callback) {
        this.callback = callback;
    }
}

// 定义 custom element
customElements.define('typed-text-effect', TypedTextEffect);
