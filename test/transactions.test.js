import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

// it.only - Roda o somente o teste especificado
// it.todo - Lembra de um teste que ainda precisa ser feito
// it.skip - Não roda o teste especificado

describe('Transactions Routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
    
        // Testando com variável
        /*
        const response = await request(app.server).post('/transactions')
        .send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit',
        })
        .expect(response.statusCode).toEqual(201)
        */
    
        // Testando com retorno direto
        await request(app.server)
        .post('/transactions')
        .send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit',
        })
        .expect(201)
    })

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-cookie')

        const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New Transaction',
                amount: 5000
            })
        ])
    })

    it('should be able to get a specific transaction', async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-cookie')

        const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New Transaction',
                amount: 5000
            })
        ])

        const transactionId = listTransactionsResponse.body.transactions[0].id

        const getTransactionsResponse = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set('Cookie', cookies)
        .expect(200)

        expect(getTransactionsResponse.body.transaction).toEqual(
            expect.objectContaining({
                id: transactionId,
                title: 'New Transaction',
                amount: 5000
            })
        )
    })

    it('should be able to get the summary', async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'Credit Transaction',
            amount: 5000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-cookie')

        await request(app.server).post('/transactions')
        .set('Cookie', cookies)
        .send({
            title: 'Debit Transaction',
            amount: 3000,
            type: 'debit',
        })

        const summaryResponse = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies)
        .expect(200)

        expect(summaryResponse.body.summary).toEqual({
            amount: 2000
        })
    })
})