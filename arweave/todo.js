/* eslint-disable no-undef */
export function handle(state, action) {
    if (action.input.function === 'create') {
        if (typeof action.input.name !== 'string' || action.input.name < 3) {
            throw new ContractError(`Invalid name provided: ${action.input.name}`)
        }
        
        state.todos.push({
            name: action.input.name,
            completed: false
        })

        return { state }
    }

    if (action.input.function === 'update') {
        if (typeof action.input.index !== 'number') {
            throw new ContractError('Invalid index')
        }
        if (typeof action.input.completed !== 'boolean') {
            throw new ContractError('Must be true or false')
        }
        if (!state.todos[action.input.index]) {
            throw new ContractError('Todo does not exist')
        }
    
        state.todos[action.input.index].completed = action.input.completed

        return { state }
    }

    if (action.input.function === 'delete') {
        if (typeof action.input.index !== 'number') {
            throw new ContractError('Invalid index')
        }
        if (!state.todos[action.input.index]) {
            throw new ContractError('Todo does not exist')
        }

        state.todos.splice(action.input.index, 1)

        return { state }
    }

    throw new ContractError('Invalid input')
}