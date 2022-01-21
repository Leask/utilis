import * as fileType from 'file-type';
import * as storage from './storage.mjs';
import * as utilitas from './utilitas.mjs';
import fetch from 'node-fetch';

const defFetchOpt = { redirect: 'follow', follow: 3, timeout: 1000 * 10 };

const getVersionOnNpm = async (packName) => {
    utilitas.assert(packName, 'Package name is required.', 400);
    const url = `https://registry.npmjs.org/-/package/${packName}/dist-tags`;
    const rp = await fetch(url).then(res => res.json());
    utilitas.assert(rp, 'Error fetching package info.', 500);
    utilitas.assert(rp !== 'Not Found' && rp.latest, 'Package not found.', 404);
    return utilitas.parseVersion(rp.latest);
};

const checkVersion = async (pack) => {
    const objPack = await utilitas.which(pack);
    const curVersion = objPack.versionNormalized;
    const newVersion = await getVersionOnNpm(objPack.name);
    return {
        name: objPack.name, curVersion, newVersion,
        updateAvailable: newVersion.normalized > curVersion.normalized,
    }
};

const getCurrentIp = async (options) => {
    const resp = await get(
        'https://ifconfig.me/all.json', { encode: 'JSON', ...options || {} }
    );
    utilitas.assert(resp?.content?.ip_addr, 'Error detecting IP address.', 500);
    return options?.raw ? resp : resp.content.ip_addr;
};

const getCurrentPosition = async () => {
    const url = 'https://geolocation-db.com/json/';
    const rp = await fetch(url).then(res => res.json());
    utilitas.assert(rp, 'Network is unreachable.', 500);
    utilitas.assert(rp.country_code, 'Error detecting geolocation.', 500);
    return rp;
};

const get = async (url, options) => {
    utilitas.assert(url, 'URL is required.');
    options = options || {};
    options.encode = utilitas.ensureString(options.encode, { case: 'UP' });
    const r = await fetch(url, { defFetchOpt, ...options.fetch || {} });
    const ts = (b) => { return b.toString('utf8'); };
    const [htpMime, buffer] = [r.headers.get('content-type'), await r.buffer()];
    const bufMime = utilitas.extract(await fileType.fileTypeFromBuffer(buffer), 'mime');
    let [mimeType, content] = [bufMime || htpMime, null];
    switch (options.encode) {
        case 'BUFFER':
            content = buffer;
            break;
        case 'BASE64':
            content = buffer.toString(options.encode);
            break;
        case 'BASE64_DATA_URL':
            content = storage.encodeBase64DataURL(mimeType, buffer);
            break;
        case 'JSON':
            try { content = JSON.parse(ts(buffer)); } catch (e) { }
            break;
        case 'TEXT':
            content = ts(buffer);
            break;
        default:
            utilitas.assert(!options.encode, 'Invalid encoding.', 400);
            content = ts(buffer);
    }
    return {
        statusCode: r.status, statusText: r.statusText, length: buffer.length,
        mimeType, content, headers: r.headers.raw(), response: r,
    };
}

export default get;
export {
    checkVersion,
    get,
    getCurrentPosition,
    getCurrentIp,
    getVersionOnNpm,
};
