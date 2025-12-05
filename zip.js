// zip.js - A minimal uncompressed ZIP file writer
export class SimpleZip {
    constructor() {
        this.files = [];
    }

    addFile(filename, content) {
        this.files.push({ filename, content });
    }

    strToBytes(str) {
        return new TextEncoder().encode(str);
    }

    generate() {
        const fileRecords = [];
        let offset = 0;
        const parts = [];
        
        for (const file of this.files) {
            const nameBytes = this.strToBytes(file.filename);
            const contentBytes = this.strToBytes(file.content);
            const crc = this.crc32(contentBytes);
            
            const header = new Uint8Array(30 + nameBytes.length);
            const view = new DataView(header.buffer);
            
            view.setUint32(0, 0x04034b50, true);
            view.setUint16(4, 10, true);
            view.setUint16(6, 0, true);
            view.setUint16(8, 0, true);
            view.setUint32(14, crc, true);
            view.setUint32(18, contentBytes.length, true);
            view.setUint32(22, contentBytes.length, true);
            view.setUint16(26, nameBytes.length, true);
            view.setUint16(28, 0, true);
            
            header.set(nameBytes, 30);
            parts.push(header);
            parts.push(contentBytes);

            fileRecords.push({
                nameBytes: nameBytes,
                crc: crc,
                size: contentBytes.length,
                offset: offset
            });
            offset += header.length + contentBytes.length;
        }

        const cdStart = offset;
        for (const record of fileRecords) {
            const header = new Uint8Array(46 + record.nameBytes.length);
            const view = new DataView(header.buffer);
            
            view.setUint32(0, 0x02014b50, true);
            view.setUint16(4, 10, true);
            view.setUint16(6, 10, true);
            view.setUint16(8, 0, true);
            view.setUint16(10, 0, true);
            view.setUint32(16, record.crc, true);
            view.setUint32(20, record.size, true);
            view.setUint32(24, record.size, true);
            view.setUint16(28, record.nameBytes.length, true);
            view.setUint16(30, 0, true);
            view.setUint16(32, 0, true);
            view.setUint16(34, 0, true);
            view.setUint16(36, 0, true);
            view.setUint32(38, 0, true);
            view.setUint32(42, record.offset, true);
            
            header.set(record.nameBytes, 46);
            parts.push(header);
            offset += header.length;
        }

        const cdEnd = offset;
        const cdSize = cdEnd - cdStart;

        const eocd = new Uint8Array(22);
        const view = new DataView(eocd.buffer);
        
        view.setUint32(0, 0x06054b50, true);
        view.setUint16(4, 0, true);
        view.setUint16(6, 0, true);
        view.setUint16(8, fileRecords.length, true);
        view.setUint16(10, fileRecords.length, true);
        view.setUint32(12, cdSize, true);
        view.setUint32(16, cdStart, true);
        
        parts.push(eocd);
        return new Blob(parts, { type: 'application/zip' });
    }

    crc32(data) {
        let crc = -1;
        for (let i = 0; i < data.length; i++) {
            crc ^= data[i];
            for (let j = 0; j < 8; j++) {
                crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
            }
        }
        return (crc ^ -1) >>> 0;
    }
}

