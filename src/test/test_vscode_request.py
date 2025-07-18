import requests

data = {
    "uri": "/Users/feiyu/Desktop/code/vscode_plugin/mock_vscode_plugin/out/extension.js",  # 你的目标文件
    "line": 135,   # 行号（从0开始）
    "character": 26  # 列号（从0开始）
}
resp = requests.post("http://localhost:3000/signatureHelp", json=data)
print("Status:", resp.status_code)
print("Result:", resp.json())