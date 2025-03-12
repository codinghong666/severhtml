// Generate the matrix input fields dynamically based on the row and column input
function generateMatrix() {
    const rows = document.getElementById("rows").value;
    const cols = document.getElementById("cols").value;

    // Set hidden fields for the POST request
    document.getElementById("hidden-rows").value = rows;
    document.getElementById("hidden-cols").value = cols;

    // Clear previous matrix inputs
    const matrixInputs = document.getElementById("matrix-inputs");
    matrixInputs.innerHTML = '';

    // Generate the input fields for the matrix
    for (let i = 0; i < rows; i++) {
        let rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        for (let j = 0; j < cols; j++) {
            let input = document.createElement('input');
            input.type = 'text';  // Allow text input (letters, symbols, etc.)
            input.name = `matrix_${i}_${j}`;
            input.classList.add('matrix-input');
            input.placeholder = `元素 (${i+1},${j+1})`;
            rowDiv.appendChild(input);
        }
        matrixInputs.appendChild(rowDiv);
    }

    // Show the matrix input section
    document.getElementById("matrix-container").style.display = 'block';
}

// Submit the matrix and display results (LaTeX matrix and transposed matrix)
function submitMatrix() {
    const matrixForm = document.getElementById("matrix-form");
    const formData = new FormData(matrixForm);

    fetch(window.location.href, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Display result: Transposed Matrix and LaTeX representation
        let resultDiv = document.getElementById("result");

        if (data.result) {
            resultDiv.innerHTML = `<h3>转置矩阵:</h3><pre>${data.result}</pre>`;
        }

        if (data.latexmatrix) {
            resultDiv.innerHTML += `<h3>矩阵 (LaTeX):</h3><p>$$ ${data.latexmatrix} $$</p>`;
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);  // Re-render the LaTeX
        }
    })
    .catch(error => console.error("Error:", error));
}




// document.addEventListener("DOMContentLoaded", function () {
//     // 获取用于显示文本的容器元素
//     const container = document.getElementById("intro-container");
//     // 定义所有待输出的文本内容
//     const texts = [
//         "  Welcome to Coding_hong's Project! Explore the tools and features.  ",
//         "1. Hand Input Can calculate the transpose of a matrix.\nEnter the number of rows and columns, fill in the matrix elements.",
//         "2. Code Input Can calculate the transpose of a matrix.\nEnter Python Code to calculate the transpose of a matrix.",
//         "3. Integration Can calculate the Integration of a function.\nEnter the function to calculate the Integration of a function.",
//         "4. Handwritten can Turn your written text to Latex.\nAnd evaluate it! (Integration, Derivation, Summation and Product)"
//     ];

//     // 通用函数：逐字输出 text 到指定 element 中
//     function typeText(element, text, delay, callback) {
//         let index = 0;
//         function type() {
//             if (index < text.length) {
//                 const char = text.charAt(index);
//                 // 遇到换行符则插入 <br> 标签
//                 element.innerHTML += (char === '\n') ? '<br>' : char;
//                 index++;
//                 setTimeout(type, delay);
//             } else if (callback) {
//                 callback();
//             }
//         }
//         type();
//     }

//     // 递归函数：依次逐行输出 texts 数组中的文本内容
//     function typeTextsSequentially(texts, container, delay, currentIndex = 0) {
//         if (currentIndex >= texts.length) return;
//         let element;
//         if (currentIndex === 0) {
//             // 第一个大标题使用 <h1> 标签
//             element = document.createElement('h1');
//             // 将大标题字体调大
//             element.style.fontSize = "3em";
//             element.style.marginBottom = "25px";
//         } else {
//             element = document.createElement('p');
//             // 调大普通文本字体
//             element.style.fontSize = "1.5em";
//             element.style.marginBottom = "20px";
//         }
//         container.appendChild(element);
//         typeText(element, texts[currentIndex], delay, function () {
//             // 当前文本输出完成后，递归调用输出下一条
//             typeTextsSequentially(texts, container, delay, currentIndex + 1);
//         });
//     }

//     // 开始逐行输出文本，设置打字延迟为 70 毫秒
//     typeTextsSequentially(texts, container, 70);
// });

