import test from 'tape'

import { incrementAsync, delay, fetchDummyTodos } from './sagas'
import { put, call } from 'redux-saga/effects'

const fetch = require('node-fetch')

/*
    gen.next() once called will return an object of shape: { done: Bool, value: any }

    every call to gen.next() should mirror the flow of what is yielded from each generator in order 
    and the status of generator's completion.


test('incrementAsync Saga test', (assert) => {
    const gen = incrementAsync()

    assert.deepEqual(
        gen.next(),
        { done: false, value: '' },
        'incrementAsync should return a Promise that will resolve after 1 second'
    )
});

*/
test('incrementAsync Saga test', (assert) => {
    const gen = incrementAsync()

    assert.deepEqual(
        gen.next().value,
        call(delay, 1000),
        'incrementAsync Saga must call delay(1000)',
    )
    
    assert.deepEqual(
        gen.next().value,
        put({type: 'INCREMENT'}),
        'incrementAsync Saga must dispatch an INCREMENT action'
    )
    
    assert.deepEqual(
        gen.next(),
        { done: true, value: undefined },
        'incrementAsync Saga must be done'
    )

    
    assert.end()
})

test('fetchDummyTodos Saga test', (assert) => {
    const todoIterator = fetchDummyTodos()

    console.log(todoIterator)
    assert.deepEqual(
        todoIterator.next().value,
        call(fetch, 'https://jsonplaceholder.typicode.com/todos'),
        "fetchDummyTodos should yield an Effect call(fetch, 'https://jsonplaceholder.typicode.com/todos')"
    )

    // init mock fetched todos
    const todos = {}
    assert.deepEqual(
        todoIterator.next(todos).value,
        put({ type: 'TODOS_RECIEVED', todos }),
        "fetchDummyTodos should yield an Effect put({ type: 'TODOS_RECIEVED', todos })"
    )
    
    // init mock error
    const error = {}
    
    assert.deepEqual(
        todoIterator.throw(error).value,
        put({ type: 'TODOS_REQUEST_FAILED', error}),
        "fetchDummyTodos should yield an Effect  put({ type: 'TODOS_REQUEST_FAILED', error})"
    )
    
    assert.end()
})