# import requests

# data = {
#     "uri": "/Users/feiyu/Desktop/type-challenges~type-challenges/scripts/toUrl.ts",  # 你的目标文件
#     "line": 1,   # 行号（从0开始）
#     "character": 14  # 列号（从0开始）
# }
# resp = requests.post("http://localhost:3000/definition", json=data)
# print("Status:", resp.status_code)
# print("Result:", resp.json())


import requests

data = {
    "uri": "/Users/feiyu/Desktop/code/vscode_plugin/mock_vscode_plugin/out/extension.js",  # 你的目标文件
    "line": 25,
    "character": 14
}
resp = requests.post("http://localhost:3000/definition", json=data)
print("Status:", resp.status_code)
print("Result:", resp.json())