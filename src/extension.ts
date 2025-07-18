// vscode 模块包含 VS Code 扩展性 API
// 导入模块并在下面的代码中使用别名 vscode 引用它
import * as vscode from 'vscode';
import * as http from 'http';

let server: http.Server | undefined;

// 当扩展被激活时调用此方法
// 扩展在第一次执行命令时被激活
export function activate(context: vscode.ExtensionContext) {
	// 使用控制台输出诊断信息 (console.log) 和错误 (console.error)
	// 这行代码只会在扩展激活时执行一次
	console.log('Congratulations, your extension "helloworld-sample" is now active!');

	// 命令已在 package.json 文件中定义
	// 现在使用 registerCommand 提供命令的实现
	// commandId 参数必须与 package.json 中的 command 字段匹配
	const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// 你在这里放置的代码将在每次执行命令时执行

		// 向用户显示消息框
		vscode.window.showInformationMessage('Hello World!');
	});

	// 注册获取定义信息的命令
	const getDefinitionCommand = vscode.commands.registerCommand('extension.getDefinition', async () => {
		await getDefinitionInfo();
	});

	context.subscriptions.push(disposable, getDefinitionCommand);

	// 启动 HTTP 服务
	server = http.createServer(async (req, res) => {
		if (req.method === 'POST' && req.url === '/definition') {
			let body = '';
			req.on('data', chunk => { body += chunk; });
			req.on('end', async () => {
				try {
					const data = JSON.parse(body);
					if (!data.uri || typeof data.line !== 'number' || typeof data.character !== 'number') {
						res.writeHead(400);
						res.end('Missing or invalid parameters');
						return;
					}
					const uri = vscode.Uri.file(data.uri);
					const position = new vscode.Position(data.line, data.character);
					const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
						'vscode.executeDefinitionProvider',
						uri,
						position
					);
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify(definitions));
				} catch (e) {
					res.writeHead(500);
					res.end('Internal error: ' + e);
				}
			});
		} else if (req.method === 'POST' && req.url === '/reference') {
			let body = '';
			req.on('data', chunk => { body += chunk; });
			req.on('end', async () => {
				try {
					const data = JSON.parse(body);
					if (!data.uri || typeof data.line !== 'number' || typeof data.character !== 'number') {
						res.writeHead(400);
						res.end('Missing or invalid parameters');
						return;
					}
					const uri = vscode.Uri.file(data.uri);
					const position = new vscode.Position(data.line, data.character);
					// includeDeclaration 默认为 true
					const references = await vscode.commands.executeCommand<vscode.Location[]>(
						'vscode.executeReferenceProvider',
						uri,
						position,
						true
					);
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify(references));
				} catch (e) {
					res.writeHead(500);
					res.end('Internal error: ' + e);
				}
			});
		} else {
			res.writeHead(404);
			res.end();
		}
	});
	server.listen(3000, () => {
		console.log('VS Code extension HTTP server listening on port 3000');
	});
}

// 获取定义信息的函数
async function getDefinitionInfo() {
	try {
		// 直接使用当前文件的路径，不依赖活跃编辑器
		const currentFilePath = __filename; // 获取当前文件的绝对路径
		const currentFileUri = vscode.Uri.file(currentFilePath);
		console.log(`当前文件路径: ${currentFilePath}`);
		console.log(`文件 URI: ${currentFileUri.toString()}`);
		// 先尝试打开文件获取文档对象
		let document: vscode.TextDocument;
		try {
			document = await vscode.workspace.openTextDocument(currentFileUri);
			console.log(`成功打开文件: ${document.fileName}`);
		} catch (error) {
			console.error('无法打开文件:', error);
			vscode.window.showErrorMessage(`无法打开文件: ${currentFilePath}`);
			return;
		}
		// 使用找到的位置调用定义提供者
		const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeDefinitionProvider',
			vscode.Uri.file("/Users/feiyu/Desktop/code/vscode-extension-samples/helloworld-sample/out/extension.js"),
			new vscode.Position(26, 14)
		);
		console.log(`Definition provider returned:`, definitions);
		// 直接在消息框中显示原始的定义对象
		const definitionText = JSON.stringify(definitions, null, 2);
		vscode.window.showInformationMessage(`Definitions found for 'getDefinitionInfo':\n${definitionText}`);
		// 在输出通道中记录详细信息
		logDefinitionInfo(document,  definitions);
	} catch (error) {
		console.error('Error in getDefinitionInfo:', error);
		vscode.window.showErrorMessage(`Error getting definition: ${error}`);
	}
}

// 在输出通道中记录详细定义信息的函数
function logDefinitionInfo(document: vscode.TextDocument, definitions: vscode.Location[]) {
	const outputChannel = vscode.window.createOutputChannel('Definition Info');
	
	outputChannel.appendLine('=== 定义信息 ===');
	outputChannel.appendLine(JSON.stringify(definitions, null, 2));
	
	outputChannel.show();
}

// 当扩展被停用时调用此方法
export function deactivate() {
	if (server) {
		server.close();
	}
}
