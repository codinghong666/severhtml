from flask import Flask, render_template, request, jsonify
import sympy as sp
import os
import uuid
import sympy as sp
import ast 
import subprocess
import base64
import shutil
import subprocess
import webbrowser
import threading
from sympy.parsing.latex import parse_latex
import time


class timer:
    def __init__(self):
        self.start = time.time()

    def end(self):
        print("%.2f" % (time.time() - self.start), end="s\n")
app = Flask(__name__)
@app.route('/')
def index():
    return render_template('index.html')
@app.route('/handinput', methods=['GET', 'POST'])
def handinput():
    if request.method == 'POST':
        rows = int(request.form.get('rows'))
        cols = int(request.form.get('cols'))
        
        matrix = []
        for i in range(rows):
            row = []
            for j in range(cols):
                value = request.form.get(f'matrix_{i}_{j}')
                if value:
                    row.append(value)  # Store as string for alphabetic characters
                else:
                    return jsonify({'error': f'矩阵元素 ({i},{j}) 缺失'}), 400
            matrix.append(row)
        matrix=sp.Matrix(matrix)
        latexmatrix = sp.latex(matrix)
        transposed_matrix =sp.latex(matrix.T)
        if matrix.shape[0] == matrix.shape[1]:
            determinant = sp.latex(matrix.det())
            if matrix.det()!=0:
                inverse = sp.latex(matrix.inv())
                return render_template('handinput.html', result=transposed_matrix, latexmatrix=latexmatrix,determinant=determinant,inverse=inverse)
        else:
            return render_template('handinput.html', result=transposed_matrix, latexmatrix=latexmatrix)
    return render_template('handinput.html')


@app.route('/codeinput')
def codeinput():
    return render_template('codeinput.html')

@app.route('/run', methods=['POST'])
def run_code():
    data = request.get_json()
    code = data.get("code", "")
    
    # 生成唯一的文件名，避免冲突
    filename = f'temp_{uuid.uuid4().hex}.py'
    
    # 将用户输入的代码保存到文件中
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(code)
    
    try:
        # 使用 subprocess 运行刚保存的 Python 文件
        result = subprocess.run(
            ['python3', filename],
            capture_output=True,
            text=True,
            timeout=10  # 限制运行时间，防止长时间运行
        )
        output = result.stdout.strip()
        # print(output)
        output_list = ast.literal_eval(output)
        m=sp.Matrix(output_list)
        output_latex=sp.latex(m)
        transposed_matrix =sp.latex(m.T)
        error = result.stderr
    except Exception as e:
        output = ""
        error = str(e)
    finally:
        # 执行完毕后删除临时文件
        if os.path.exists(filename):
            os.remove(filename)

    
    # 返回执行结果给前端
    if m.shape[0] == m.shape[1]:
        determinant = sp.latex(m.det())
        if m.det()!=0:
            inverse = sp.latex(m.inv())
            return jsonify({"output": output_latex, "error": error,"transposed":transposed_matrix,"determinant":determinant,"inverse":inverse})
        else:
            return jsonify({"output": output_latex, "error": error,"transposed":transposed_matrix,"determinant":determinant})
    else:
        return jsonify({"output": output_latex, "error": error,"transposed":transposed_matrix})

@app.route('/integrate', methods=['GET', 'POST'])
def integrate():
    if request.method == 'POST':
        data = request.get_json()
        expression = data.get("expression")
        variable = data.get("variable")
        try:
            # 使用 Sympy 解析 LaTeX 表达式
            parsed_expr = parse_latex(expression)
            # 检查变量字符串是否包含积分上下界（例如 "x 0 1"）
            bk = variable.split(" ")
            if len(bk) == 3:
                # 第一个部分作为变量
                var = sp.symbols(bk[0])
                # 将下界和上界转化为数字或符号表达式
                lower = sp.sympify(bk[1])
                upper = sp.sympify(bk[2])
                # 计算定积分
                integral = sp.integrate(parsed_expr, (var, lower, upper))
                # 格式化积分区间的 LaTeX 表示（例如 _{0}^{1} ）
                rg = '_{' + sp.latex(lower) + '}^{' + sp.latex(upper) + '}'
            else:
                # 只有变量，没有积分上下界，计算不定积分
                var = sp.symbols(variable)
                integral = sp.integrate(parsed_expr, var)
                rg = ''
            # 对结果进行化简和约分
            integral = sp.simplify(integral)
            integral = sp.cancel(integral)
            # 生成 LaTeX 格式的积分结果
            result = r'\int' + rg + expression + '=' + sp.latex(integral)
            return jsonify({"result": result})
        except Exception as e:
            return jsonify({"error": str(e)})
    return render_template('integrate.html')

def run_streamlit():
    """ 启动 Streamlit 应用 """
    subprocess.run(["streamlit", "run", "texteller/TexTeller/src/web.py"], check=True)

@app.route('/handwritten', methods=['GET'])
def handwritten():
    folder_path = os.path.join(os.path.dirname(__file__), 'texteller', 'TexTeller', 'src')
    command = './start_web.sh'
    print(command)
    try:
        T = timer()
        print("in")
        result = subprocess.run(command, shell=True, cwd=folder_path, capture_output=True, text=True)
        T.end()
        # return '<script>window.close();</script>'
        return jsonify({"output": result.stdout, "error": result.stderr})
    except Exception as e:
        return jsonify({"error": str(e)})


    
# if __name__ == '__main__':
#     app.run(debug=True,port=8080)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
