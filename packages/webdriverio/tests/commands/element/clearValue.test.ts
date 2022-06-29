import { expect, describe, it, beforeAll, afterEach, vi } from 'vitest'

// @ts-ignore mocked (original defined in webdriver package)
import got from 'got'
import { remote } from '../../../src'

vi.mock('got')

describe('clearValue test', () => {
    let browser: any
    let elem: any

    beforeAll(async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
        elem = await browser.$('#foo')
    })

    it('should allow to clear an input element', async () => {
        await elem.clearValue()
        expect(got.mock.calls[2][0].pathname)
            .toBe('/session/foobar-123/element/some-elem-123/clear')
    })

    afterEach(() => {
        got.mockClear()
    })
})
