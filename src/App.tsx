import React, { ReactElement, useEffect, useState } from 'react';
import './tailwind.output.css';
import './App.css';
import Arweave from 'arweave';
import { readContract, smartweave } from 'smartweave';
import { JWKInterface } from 'arweave/node/lib/wallet';

function App() {

	const [fetchTodos, setFetchTodos] = useState(true);
	const [todos, setTodos] = useState([]);
	const [wallet, setWallet] = useState(null);
	const [address, setAddress] = useState('');
	const [name, setName] = useState('');

	const arweave = Arweave.init({
		host: 'arweave.net',// Hostname or IP address for a Arweave host
		port: 443,          // Port
		protocol: 'https',  // Network protocol http or https
		timeout: 20000,     // Network request timeouts in milliseconds
		logging: false,     // Enable network request logging
	});

	const contractId = 'RFQjB616cnq-UMygVMgk8ToH04B-i7txpWfpBWhkTYM';

	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	useEffect(() => {
		const getTodos = async () => {
			try {
				const result = await readContract(arweave, contractId);
				setTodos(result.todos);
			} catch (e) {
				console.log(e);
			}
		};
		const getAddress = async () => {
			setAddress(await arweave.wallets.jwkToAddress(wallet! as JWKInterface));
		}
		if (fetchTodos) {
			getTodos();
			setFetchTodos(false);
		}
		if (wallet) {
			getAddress();
		}
	});

	const uploadWallet = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const fileReader = new FileReader();
		fileReader.onload = async (e) => {
			setWallet(JSON.parse(e.target!.result as string));
		}
		if (evt.target.files?.length) {
			fileReader.readAsText(evt.target.files[0]);
		}
	}

	const addTask = async () => {
		if (name && wallet) {
			console.log('Saving task...')
			const result = await smartweave.interactWrite(
				arweave, wallet! as JWKInterface,
				contractId,
				{ function: 'create', name: name }
			);
			setName('');
			console.log('Saved.')
			console.log(result)
		}
	}

	const delTask = async (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (wallet) {
			console.log('Deleting task...')
			const result = await smartweave.interactWrite(
				arweave, wallet! as JWKInterface,
				contractId,
				{ function: 'delete', index: evt.currentTarget.value }
			);
			console.log('Deleted.')
			console.log(result)
		}
	}

	// eslint-disable-next-line no-empty-pattern
	const TodoList = ({ todos: [] }): ReactElement => (
		<ul className="todo-list mt-4">
			{todos.map((t: { name: string; completed: boolean }, idx: number) =>
				<li className="flex justify-between items-center mt-3" key={idx}>
					<div className="flex items-center">
						<input type="checkbox" name="" id="" />
						<div className="capitalize ml-3 text-xl font-semibold">
							{t.name}
						</div>
					</div>
					<div>
						<button onClick={delTask} value={idx}>
							<svg className="w-10 h-10 text-red-600 fill-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
								<path d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				</li>
			)}
		</ul>
	);

	return (
		<div className="bg-gray-200 text-gray-800 flex flex-col items-center justify-center h-screen">
			{!wallet &&
				<div className='bg-white rounded-md shadow-md p-5'>
					<h4 className='font-bold text-3xl mb-5'>Upload a Wallet to Use App</h4>
					<input type="file" className='overflow-hidden' onChange={uploadWallet} />
				</div>
			}
			{wallet &&
				<div className='w-full text-center'>
					<div className="font-bold text-3xl mb-5">{address}</div>
					<div className="font-bold text-3xl mb-5">Todo Application</div>
					<div className="container px-3 max-w-md mx-auto">
						<div className="bg-white rounded shadow px-4 py-4">
							<div className="flex items-center text-sm mt-2">
								<button onClick={addTask}>
									<svg className="w-10 h-10 mr-3 focus:outline-none" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
										<path d="M12 4v16m8-8H4"></path>
									</svg>
								</button>
							<span className='text-xl font-bold'>Click to add task</span>
							</div>
						<input
							type="text"
							value={name}
							placeholder="what is your plan for today"
							className="rounded-sm shadow-sm px-4 py-2 border border-gray-200 w-full mt-4"
							onChange={event => setName(event.target.value)}
						/>
							<TodoList todos={todos} />	
						</div>
					</div>
				</div>
			}
		</div>
	);
}

export default App;
