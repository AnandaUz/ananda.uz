import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from 'google-auth-library';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const creds = require('../.data/iseeweight-ca409b4ceb29.json');
// 1. Авторизация
const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});



// ID таблицы берется из адресной строки:
// https://docs.google.com/spreadsheets/d/ID_ВОТ_ТУТ/edit

const id_sheet = '1KljjlO4zBNfc8WuBd6Db3wfgt8KSAUY32HSNbVQueBI'
const doc = new GoogleSpreadsheet(id_sheet, serviceAccountAuth);



async function updateCell() {
    await doc.loadInfo(); // Загружаем информацию о таблице

    const sheet = doc.sheetsByIndex[0]; // Берем самый первый лист (вкладку)

    // Загружаем ячейки в память, чтобы с ними работать
    // Например, загрузим диапазон от A1 до C5
    await sheet.loadCells('A1:C5');

    // Выбираем конкретную ячейку (индексы начинаются с 0)
    // A1 — это (0, 0), B2 — это (1, 1)
    const cellA1 = sheet.getCell(0, 0);

    cellA1.value = 'Привет, Бот!';
    cellA1.textFormat = { bold: true }; // Можно даже менять стиль!

    // Сохраняем изменения
    await sheet.saveUpdatedCells();

    console.log('Ячейка А1 обновлена!');
}
async function addDataWithFormula() {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // 1. Подготавливаем данные
    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sheetsEpoch = new Date(1899, 11, 30);
    const dateSerial = (dateOnly - sheetsEpoch) / 86400000;
    const value = 55.3; // Число с точкой

    const row = 20; // индекс 5-й строки

    await sheet.insertDimension('ROWS', { startIndex: row, endIndex: row+1 });

    // 2. Загружаем эту новую пустую строку
    await sheet.loadCells({
        startRowIndex: row,
        endRowIndex: row+1,
        startColumnIndex: 0,
        endColumnIndex: 4
    });

    const cell0 = sheet.getCell(row, 0);
    cell0.value = dateSerial;
    cell0.numberFormat = { type: 'DATE', pattern: 'dd.mm.yyyy' };
    sheet.getCell(row, 1).value = value
    const timeCell = sheet.getCell(row, 2);
    timeCell.value = 'aaaa';
    timeCell.numberFormat = { type: 'TIME', pattern: 'hh:mm:ss' };
    sheet.getCell(row, 3).value = '=AVERAGE(B5:B14)';

    // 5. Сохраняем изменения в Google Таблицу
    await sheet.saveUpdatedCells();

    console.log('✅ Данные вставлены в 5-ю строку со сдвигом колонок A-D!');
}

function buildLineChartRequest({
    sourceSheetId,
    targetSheetId,
    title,
    seriesStartCol,
    seriesEndCol,
    anchorRow,
    anchorCol
}) {
    const startRowIndex = 19; // A20
    const endRowIndex = 35; // A35 (exclusive)

    return {
        addChart: {
            chart: {
                spec: {
                    title,
                    basicChart: {
                        chartType: 'LINE',
                        legendPosition: 'BOTTOM_LEGEND',
                        axis: [
                            { position: 'BOTTOM_AXIS', title: 'Дата' },
                            { position: 'LEFT_AXIS', title: 'Значение' }
                        ],
                        domains: [
                            {
                                domain: {
                                    sourceRange: {
                                        sources: [
                                            {
                                                sheetId: sourceSheetId,
                                                startRowIndex,
                                                endRowIndex,
                                                startColumnIndex: 0,
                                                endColumnIndex: 1
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        series: [
                            {
                                series: {
                                    sourceRange: {
                                        sources: [
                                            {
                                                sheetId: sourceSheetId,
                                                startRowIndex,
                                                endRowIndex,
                                                startColumnIndex: seriesStartCol,
                                                endColumnIndex: seriesEndCol
                                            }
                                        ]
                                    }
                                },
                                targetAxis: 'LEFT_AXIS'
                            }
                        ]
                    }
                },
                position: {
                    overlayPosition: {
                        anchorCell: {
                            sheetId: targetSheetId,
                            rowIndex: anchorRow,
                            columnIndex: anchorCol
                        },
                        offsetXPixels: 0,
                        offsetYPixels: 0
                    }
                }
            }
        }
    };
}

async function createCharts() {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const sourceSheetId = sheet.sheetId;
    const targetSheetId = sheet.sheetId;

    const requests = [
        buildLineChartRequest({
            sourceSheetId,
            targetSheetId,
            title: 'График B',
            seriesStartCol: 1,
            seriesEndCol: 2,
            anchorRow: 1,
            anchorCol: 4 // E2
        }),
        buildLineChartRequest({
            sourceSheetId,
            targetSheetId,
            title: 'График D',
            seriesStartCol: 3,
            seriesEndCol: 4,
            anchorRow: 19,
            anchorCol: 4 // E20
        })
    ];

    const response = await doc.sheetsApi.post(':batchUpdate', {
        json: { requests }
    });

    const data = await response.json();
    const chartIds = (data.replies || [])
        .map((reply) => reply.addChart?.chart?.chartId)
        .filter(Boolean);
    console.log('✅ Графики добавлены! chartId:', chartIds.join(', '));
}

addDataWithFormula().catch(console.error);
// createCharts().catch(console.error);
// createChartsOnNewSheet().catch(console.error);

async function createChartsOnNewSheet() {
    await doc.loadInfo();
    const sourceSheet = doc.sheetsByIndex[0];
    const sourceSheetId = sourceSheet.sheetId;
    const title = 'Графики';
    let targetSheet = doc.sheetsByTitle[title];

    if (!targetSheet) {
        targetSheet = await doc.addSheet({ title });
    }

    const targetSheetId = targetSheet.sheetId;
    const requests = [
        buildLineChartRequest({
            sourceSheetId,
            targetSheetId,
            title: 'График B',
            seriesStartCol: 1,
            seriesEndCol: 2,
            anchorRow: 1,
            anchorCol: 1 // B2
        }),
        buildLineChartRequest({
            sourceSheetId,
            targetSheetId,
            title: 'График D',
            seriesStartCol: 3,
            seriesEndCol: 4,
            anchorRow: 19,
            anchorCol: 1 // B20
        })
    ];

    const response = await doc.sheetsApi.post(':batchUpdate', {
        json: { requests }
    });

    const data = await response.json();
    const chartIds = (data.replies || [])
        .map((reply) => reply.addChart?.chart?.chartId)
        .filter(Boolean);
    console.log('✅ Графики добавлены на вкладку "Графики". chartId:', chartIds.join(', '));
}



// updateCell().catch(console.error);

