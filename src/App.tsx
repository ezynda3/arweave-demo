import React, { ReactElement, useEffect, useState } from 'react';
import './tailwind.output.css';
import './App.css';
import Arweave from 'arweave';
import { readContract } from 'smartweave';

function App() {

	const [fetchTodos, setFetchTodos] = useState(true);
	const [todos, setTodos] = useState([]);

	const arweave = Arweave.init({
		host: 'arweave.net',// Hostname or IP address for a Arweave host
		port: 443,          // Port
		protocol: 'https',  // Network protocol http or https
		timeout: 20000,     // Network request timeouts in milliseconds
		logging: false,     // Enable network request logging
	});

	const contractId = '7fVlsUMHXbkAknVL-ZYW6si8_wDd_6ZAu_tlUpevZb4';

	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	useEffect(() => {
		const getTodos = async () => {
			const result = await readContract(arweave, contractId);
			setTodos(result.todos);
		};
		if (fetchTodos) {
			getTodos();
			setFetchTodos(false);
		}
	});

	// eslint-disable-next-line no-empty-pattern
	const TodoList = ({ todos: [] }): ReactElement => (
		<ul className="todo-list mt-4">
			{todos.map((t: { name: string; completed: boolean }) =>
				<li className="flex justify-between items-center mt-3">
					<div className="flex items-center">
						<input type="checkbox" name="" id="" />
						<div className="capitalize ml-3 text-sm font-semibold">
							{t.name}
						</div>
					</div>
					<div>
						<button>
							<svg className=" w-4 h-4 text-gray-600 fill-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
								<path d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				</li>
			)}
		</ul>
	);

	console.log(todos);
	return (
		<div className="bg-gray-200 text-gray-800 flex flex-col items-center justify-center h-screen">
			<div className="font-bold text-3xl mb-5">Todo Application</div>
			<div className="container px-3 max-w-md mx-auto">
				<div className="bg-white rounded shadow px-4 py-4">
					<div className="flex items-center text-sm mt-2">
						<button>
							<svg className="w-3 h-3 mr-3 focus:outline-none" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
								<path d="M12 4v16m8-8H4"></path>
							</svg>
						</button>
						<span className='text-lg font-bold'>Click to add task</span>
					</div>
					<input type="text" placeholder="what is your plan for today" className=" rounded-sm shadow-sm px-4 py-2 border border-gray-200 w-full mt-4" />
					<TodoList todos={todos} />	
				</div>
			</div>
		</div>
	);
}

export default App;
