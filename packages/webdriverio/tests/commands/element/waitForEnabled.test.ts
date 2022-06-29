import { expect, describe, it, vi, beforeAll } from 'vitest'

// @ts-ignore mocked (original defined in webdriver package)
import got from 'got'
import { remote } from '../../../src'

vi.mock('got')

describe('waitForEnabled', () => {
    const timeout = 1000
    let browser: any

    beforeAll(async () => {
        got.mockClear()

        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
    })

    it('should wait for the element to exist', async () => {
        const tmpElem = await browser.$('#foo')
        const elem = {
            waitForEnabled : tmpElem.waitForEnabled,
            waitForExist : vi.fn(),
            elementId : null,
            waitUntil : vi.fn(),
            options : { waitforInterval: 5, waitforTimeout: timeout }
        }

        await elem.waitForEnabled({ timeout })
        expect(elem.waitForExist).toBeCalled()
    })

    it('element should already exist on the page', async () => {
        const tmpElem = await browser.$('#foo')
        const elem = {
            waitForEnabled : tmpElem.waitForEnabled,
            waitForExist : vi.fn(),
            elementId : 123,
            waitUntil : vi.fn(),
            isEnabled : vi.fn(() => Promise.resolve()),
            options : { waitforInterval: 5, waitforTimeout: timeout }
        }

        await elem.waitForEnabled({ timeout })
        expect(elem.waitForExist).not.toBeCalled()
    })

    it('should call waitUntil', async () => {
        const cb = vi.fn()
        const tmpElem = await browser.$('#foo')
        const elem = {
            selector : '#foo',
            waitForEnabled : tmpElem.waitForEnabled,
            waitForExist : vi.fn(),
            elementId : 123,
            waitUntil : vi.fn(((cb))),
            isEnabled : vi.fn(() => Promise.resolve()),
            options : { waitforInterval: 5, waitforTimeout: timeout }
        }

        await elem.waitForEnabled({ timeout })

        expect(cb).toBeCalled()
        expect(elem.waitUntil.mock.calls).toMatchSnapshot()
    })

    it('should call isEnabled and return true', async () => {
        const tmpElem = await browser.$('#foo')
        const elem = {
            selector : '#foo',
            waitForEnabled : tmpElem.waitForEnabled,
            waitForExist : vi.fn(),
            elementId : 123,
            waitUntil : tmpElem.waitUntil,
            isEnabled : vi.fn(() => true),
            options : { waitforInterval: 5, waitforTimeout: timeout }
        }

        const result = await elem.waitForEnabled({ timeout })
        expect(result).toBe(true)
    })

    it('should call isEnabled and return false', async () => {
        const tmpElem = await browser.$('#foo')
        const elem = {
            selector : '#foo',
            waitForEnabled : tmpElem.waitForEnabled,
            waitForExist : vi.fn(),
            elementId : 123,
            waitUntil : tmpElem.waitUntil,
            isEnabled : vi.fn(() => false),
            options : { waitforInterval: 5, waitforTimeout: timeout }
        }

        try {
            await elem.waitForEnabled({ timeout })
        } catch (err: any) {
            expect(err.message).toBe(`element ("#foo") still not enabled after ${timeout}ms`)
        }
    })

    it('should do reverse', async () => {
        const cb = vi.fn()
        const tmpElem = await browser.$('#foo')
        const elem = {
            selector : '#foo',
            waitForEnabled : tmpElem.waitForEnabled,
            waitForExist : vi.fn(),
            elementId : 123,
            waitUntil : vi.fn(((cb))),
            isEnabled : vi.fn(() => Promise.resolve()),
            options : { waitforInterval: 50, waitforTimeout: 500 }
        }

        await elem.waitForEnabled({ reverse: true })
        expect(elem.waitUntil.mock.calls).toMatchSnapshot()
    })

    it('should call isEnabled and return false with custom error', async () => {
        const tmpElem = await browser.$('#foo')
        const elem = {
            selector : '#foo',
            waitForEnabled : tmpElem.waitForEnabled,
            waitForExist : vi.fn(),
            elementId : 123,
            waitUntil : tmpElem.waitUntil,
            isEnabled : vi.fn(() => false),
            options : { waitforTimeout : 500 },
        }

        try {
            await elem.waitForEnabled({
                timeout,
                reverse: false,
                timeoutMsg: 'Element foo never enabled'
            })
        } catch (err: any) {
            expect(err.message).toBe('Element foo never enabled')
        }
    })
})
