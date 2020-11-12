import React, { ReactElement, useEffect, useState } from 'react';
import Arweave from 'arweave';
import { readContract, smartweave, selectWeightedPstHolder } from 'smartweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import './tailwind.output.css';
import './App.css';

function App() {

	const [fetchTodos, setFetchTodos] = useState(true);
	const [todos, setTodos] = useState<any[]>([]);
	const [wallet, setWallet] = useState(null);
	const [address, setAddress] = useState('');
	const [name, setName] = useState('');
	const [pending, setPending] = useState(false);

	const arweave = Arweave.init({
		host: 'arweave.net',// Hostname or IP address for a Arweave host
		port: 443,          // Port
		protocol: 'https',  // Network protocol http or https
		timeout: 20000,     // Network request timeouts in milliseconds
		logging: false,     // Enable network request logging
	});

	interface Todos {
		id: string,
		name: string,
		completed: boolean,
		adding: boolean,
		deleting: boolean,
	}

	const contractId = '5NgGX4OToJ4M5ohWP4yxaTz_2oPsnk7vmR0v3mqXi_A'
	const tokenId = '19tBk-g7euaGOJbT62BAIZqcxrUkraQ82d-3eqDHFzQ'

	const getTodos = async () => {
		console.log('Getting Todos')
		try {
			const result = await readContract(arweave, contractId);
			let newTodos: any[] = [];
			await result.todos.forEach((item: Todos) => {
				newTodos.push({
					id: item.id,
					name: item.name,
					completed: item.completed,
					adding: false,
					deleting: false,
				})
			});

			if (!sessionStorage.getItem('Todos')) {
				sessionStorage.setItem('Todos', JSON.stringify(newTodos));
			}

			if (JSON.stringify(newTodos) !== sessionStorage.getItem('Todos')) {
				const pendingTodos = setPendingStatus(sessionStorage.getItem('Todos'), newTodos)
				console.log(pendingTodos)
				sessionStorage.removeItem('Todos')
				sessionStorage.setItem('Todos', JSON.stringify(pendingTodos));
				if (pendingTodos !== undefined) {
					setTodos(pendingTodos)
				}
			} else {
				setTodos(newTodos);
			}
		} catch (e) {
			console.log(e);
		}
	};

	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	useEffect(() => {
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

	const setPendingStatus = (sessionTodos: string | null, todos: any[]) => {
		if (sessionTodos !== null) {
			let parsedTodos = JSON.parse(sessionTodos)

			let newTodos = []

			for (let i=0; i < parsedTodos.length; i++) {
				if ((todos.find(todo => todo.id === parsedTodos[i].id)) !== undefined || parsedTodos[i].adding === true) {
					if (todos.find(todo => todo.id === parsedTodos[i].id) !== undefined) {
						console.log(todos)
						if (todos.find(todo => todo.id === parsedTodos[i].id).adding !== parsedTodos[i].adding) {
							parsedTodos[i].adding = false
							parsedTodos[i].name = todos.find(todo => todo.id === parsedTodos[i].id).name
						}
					}
					
					newTodos.push(parsedTodos[i])
				}
			}
			
			for (let i=0; i < todos.length; i++) {
				if ((parsedTodos.find((todo: { id: any; }) => todo.id === todos[i].id) === undefined)) {
					newTodos.push(todos[i])
				}
			}

			console.log(newTodos);
			return newTodos
		}
	}

	const uploadWallet = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const fileReader = new FileReader();
		fileReader.onload = async (e) => {
			setWallet(JSON.parse(e.target!.result as string));
		}
		if (evt.target.files?.length) {
			fileReader.readAsText(evt.target.files[0]);
		}
	}

	const sendTip = async () => {
		const { balances } = await readContract(arweave, tokenId)
		console.log(balances)
		const holder = selectWeightedPstHolder(balances)
		console.log(holder)
		const tx = await arweave.createTransaction({ target: holder, quantity: arweave.ar.arToWinston('0.001') }, wallet! as JWKInterface)
		await arweave.transactions.sign(tx, wallet! as JWKInterface)
		const result = await arweave.transactions.post(tx)
		console.log(result)
	}

	const addTask = async () => {
		if (name && wallet) {
			setPending(true)
			console.log('Saving task...')
			await sendTip();
			const result = await smartweave.interactWrite(
				arweave, wallet! as JWKInterface,
				contractId,
				{ function: 'create', name: name }
			);

			let newArray = todos;
			newArray.push({
				id: result,
				name: `Adding '${name}'...`,
				completed: false,
				adding: true,
			})
			sessionStorage.removeItem('Todos');
			sessionStorage.setItem('Todos', JSON.stringify(newArray));
			getTodos();
			setName('');

			subscribeToTransaction(result.toString(), 0);
		}
	}

	const delTask = async (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (wallet) {
			setPending(true);
			console.log('Deleting task...')
			const id = evt.currentTarget.value
			await sendTip();
			const result = await smartweave.interactWrite(
				arweave, wallet! as JWKInterface,
				contractId,
				{ function: 'delete', id }
			);
			console.log(result)

			let newArray = todos;
			newArray.find(todo => todo.id === id).name = 'Deleting...';
			newArray.find(todo => todo.id === id).deleting = true;
			console.log(newArray)

			sessionStorage.removeItem('Todos');
			sessionStorage.setItem('Todos', JSON.stringify(newArray));
			getTodos();

			// subscribeToTransaction(result.toString(), index);
		}
	}

	const subscribeToTransaction = async (transaction: string, index: number) => {
		arweave.transactions.getStatus(transaction).then(status => {
			if (status.confirmed == null) {
				setTimeout(() => subscribeToTransaction(transaction, index), 10000)
			} else {
				getTodos();
				setPending(false)
				console.log('Transaction confirmed: ', transaction);
			}
		})
	}

	// eslint-disable-next-line no-empty-pattern
	const TodoList = ({ todos: [] }): ReactElement => (
		<ul className="todo-list mt-4">
			{todos.map((t: { id: string, name: string; completed: boolean, adding: boolean, deleting: boolean },  index: number) =>
				<li className="flex justify-between items-center mt-3" key={index}>
					<div className="flex items-center">
						<input type="checkbox" name="" id="" />
						<div className="capitalize ml-3 text-xl font-semibold">
							{t.name}
						</div>
					</div>
					{(!t.adding || !t.deleting) && <div>
						<button onClick={delTask} value={t.id}>
							<svg className="w-10 h-10 text-red-600 fill-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
								<path d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>}
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
					<br />
					{pending && <div>Transaction pending...</div>}
				</div>
			}
		</div>
	);
}

export default App;
