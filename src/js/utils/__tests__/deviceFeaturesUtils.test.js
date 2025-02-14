import coinsJSON from '../../../data/coins.json';
import configJSON from '../../../data/config.json';
import { parseCoinsJson, getAllNetworks } from '../../data/CoinInfo';

import {
    parseCapabilities,
    getUnavailableCapabilities,
    parseRevision,
} from '../deviceFeaturesUtils';

describe('utils/deviceFeaturesUtils', () => {
    beforeAll(() => {
        parseCoinsJson(coinsJSON);
    });

    it('parseCapabilities', () => {
        const feat1 = {
            major_version: 1,
        };
        const feat2 = {
            major_version: 2,
        };
        // default T1
        expect(parseCapabilities(feat1)).toEqual([
            'Capability_Bitcoin',
            'Capability_Bitcoin_like',
            'Capability_Crypto',
            'Capability_Ethereum',
            'Capability_NEM',
            'Capability_Stellar',
            'Capability_U2F',
        ]);

        // default T2
        expect(parseCapabilities(feat2)).toEqual([
            'Capability_Bitcoin',
            'Capability_Bitcoin_like',
            'Capability_Binance',
            'Capability_Cardano',
            'Capability_Crypto',
            'Capability_EOS',
            'Capability_Ethereum',
            'Capability_Monero',
            'Capability_NEM',
            'Capability_Ripple',
            'Capability_Stellar',
            'Capability_Tezos',
            'Capability_U2F',
        ]);

        expect(
            parseCapabilities({
                major_version: 2,
                capabilities: [],
            }),
        ).toEqual([
            'Capability_Bitcoin',
            'Capability_Bitcoin_like',
            'Capability_Binance',
            'Capability_Cardano',
            'Capability_Crypto',
            'Capability_EOS',
            'Capability_Ethereum',
            'Capability_Monero',
            'Capability_NEM',
            'Capability_Ripple',
            'Capability_Stellar',
            'Capability_Tezos',
            'Capability_U2F',
        ]);

        // bitcoin only
        expect(
            parseCapabilities({
                major_version: 1,
                capabilities: [1],
            }),
        ).toEqual(['Capability_Bitcoin']);

        // no features
        expect(parseCapabilities(null)).toEqual([]);

        // unknown
        expect(
            parseCapabilities({
                major_version: 1,
                capabilities: [1000],
            }),
        ).toEqual([]);
    });

    it('getUnavailableCapabilities', () => {
        const support = configJSON.supportedFirmware;
        const coins = getAllNetworks();

        const feat1 = {
            major_version: 1,
            minor_version: 8,
            patch_version: 3,
            capabilities: undefined,
        };
        feat1.capabilities = parseCapabilities(feat1);

        // default Capabilities T1
        expect(getUnavailableCapabilities(feat1, coins, support)).toEqual({
            ada: 'no-support',
            tada: 'no-support',
            bnb: 'no-support',
            eos: 'no-support',
            ppc: 'update-required',
            sys: 'update-required',
            tppc: 'update-required',
            txrp: 'no-support',
            uno: 'update-required',
            xrp: 'no-support',
            xtz: 'no-support',
            xvg: 'update-required',
            zcr: 'update-required',
            replaceTransaction: 'update-required',
            decreaseOutput: 'update-required',
            eip1559: 'update-required',
            taproot: 'update-required',
            aopp: 'update-required',
        });

        const feat2 = {
            major_version: 2,
            minor_version: 3,
            patch_version: 3,
            capabilities: undefined,
        };
        feat2.capabilities = parseCapabilities(feat2);

        // default Capabilities T2
        expect(getUnavailableCapabilities(feat2, coins, support)).toEqual({
            replaceTransaction: 'update-required',
            decreaseOutput: 'update-required',
            eip1559: 'update-required',
            taproot: 'update-required',
            aopp: 'update-required',
        });

        // added new capability
        expect(
            getUnavailableCapabilities(feat2, coins, [
                {
                    min: ['0', '2.99.99'],
                    capabilities: ['newCapabilityOrFeature'],
                },
            ]),
        ).toEqual({
            newCapabilityOrFeature: 'update-required',
        });

        expect(
            getUnavailableCapabilities(feat2, coins, [
                {
                    min: ['0', '0'],
                    capabilities: ['newCapabilityOrFeature'],
                },
            ]),
        ).toEqual({
            newCapabilityOrFeature: 'no-support',
        });

        // without capabilities
        expect(getUnavailableCapabilities({}, coins, support)).toEqual({});
    });

    describe('parseRevision', () => {
        it('parses hexadecimal raw bytes to the standard hexadecimal notation', () => {
            expect(parseRevision({ revision: '6466303936336563' })).toEqual('df0963ec');
        });

        it('does nothing when standard hexadecimal notation is parsed', () => {
            expect(parseRevision({ revision: 'f4424ece1ccb7fc0d6cad00ff840fac287a34f07' })).toEqual(
                'f4424ece1ccb7fc0d6cad00ff840fac287a34f07',
            );
        });

        it('does nothing when standard hexadecimal notation with only 0-9 symbols is parsed', () => {
            expect(parseRevision({ revision: '2442434213337100161230033840333287234307' })).toEqual(
                '2442434213337100161230033840333287234307',
            );
        });

        it('passes null, caused by bootloader mode, through', () => {
            expect(parseRevision({ revision: null })).toEqual(null);
        });
    });
});
