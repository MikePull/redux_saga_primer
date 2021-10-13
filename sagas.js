import { put, takeEvery, all, call, takeLatest } from 'redux-saga/effects'
const fetch = require('node-fetch')

export const delay = (ms) => new Promise(res => setTimeout(res, ms)) 

function* helloSagas() {
    console.log('Hello Sagas!')
} 

export function* incrementAsync() {
    yield call(delay, 1000)
    yield put({ type: 'INCREMENT'})
}

/* 

    Instead of doing yield delay(1000), we're now doing yield call(delay, 1000). What's the differene?
    In the first case, the yield expression delay(1000) is evaluated before it gets passed to the caller of 
    next (the caller could be middleware when running our code. It could also be our test code which runs the 
    Generator function and iterates over the returned Generator) So what the caller gets is a Promise, like in the 
    test code above. 

    In the second case the yield expression delay(1000) is evaluated before it gets passed to the caller of 
    'next' , 'call' just like 'put' returns an Effect which instructs the middleware to call a given function 
    with the given arguments. In fact, neither 'put' nor 'call' performs any dispatch or async call by themselves,
    they return plain Javascript objects.

    put({ type: 'INCREMENT' }) // => { PUT: {type: 'INCREMENT'} }
    call(delay, 1000)          // => { CALL: {fn: delay, args: [1000]} }

    What happens is that the middleware examines the type of each yielded Effect then decides how to fulfill
    that Effect. If the Effect type is a 'PUT' then it will dispatch an action to the Store. If the Effect is 
    a 'CALL' then it'll call the given function.

*/

function* watchIncrementAsync() {
    yield takeEvery('INCREMENT_ASYNC', incementAsync)
}


// Here we are only exporting the rootSaga as a single entrypoint to start all sagas at once.
// The 2 resulting generatorss will be started in parallel. 
export default function* rootSaga() {
    yield all([
        helloSaga(),
        watchIncrementAsync()
    ])
}


/*

    This will create the task that will perform an asynchronous "fetching" action
    where "takeEvery" allows multiple "fetchData" instances to be started concurrently
    from the "FETCH_REQUESTED" action watcher meaning a "fetchData" task can be ran 
    while another has not yet finished.

*/
export function* fetchData(action) {
    try {
        const data = yield call(fetch, action.payload.url)
        yield put({type: "FETCH_SUCCEEDED", data})
    } catch (err) {
        yield put({ type: "FETCH_FAILED", err })
    }
}

// Function to launch the asynchronous fetching action

export function* watchEveryFetchData() {
    yield takeEvery('FETCH_REQUESTED', fetchData)
}

/*
    Unlike 'takeEvery', 'takeLatest' allows one 'fetchData' task to run at any moment.
    The latest started task will cancel any previously running tasks. 
*/ 

export function* watchLatestFetchData() {
    yield takeLatest("FETCH_REQUESTED", fetchData)
}

/*
    'takeEvery' can be used to combine 'task watchers' in one saga (as with 'fork()') like so:

    export defualt function* rootSaga() {

        yield takeEvery('FETCH_USERS', fetchUsers)
        yield takeEvery('CREATE_USER', createUser)
    }
*/


/*

    Just as in Redux you can use action creators to create a plain object describing the action that will
    get executed by the Store, 'call' creates a plain object describing the function call. 
    Which allows us to easily test the Generator outside the Redux environment. Because 'call' is just
    a function which returns a plain Object. 

*/

// the 'put' function mainly creates the dispatch Effect

function fetchDummyTodosApi() {
    return fetch('https://jsonplaceholder.typicode.com/todos')
            .then(response => ({ response }))
            .then(error => ({ error })) 
}

export function* fetchDummyTodos() {
    const { response, error } = yield call(fetchDummyTodosApi)
    if (response) {
        yield put({ type: 'TODOS_RECEIVED', todos: response })
    } else {
        yield put({ type: 'TODOS_REQUEST_FAILED', error})
    }

}

/*
export function* fetchDummyTodos() {
    try { 
        const todos = yield call(() =>
            
        )
        
        yield put({ type: 'TODOS_RECEIVED', todos})
    } catch (error) {
        yield put({ type: 'TODOS_REQUEST_FAILED', error})
    }
}

*/