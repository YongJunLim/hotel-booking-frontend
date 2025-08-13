import * as fs from 'fs'
import * as xlsx from 'xlsx'

interface ConvertedRow {
  [key: string]: string | number | boolean | null
}

type CellValue = string | number | boolean | null

export const convertCsvToJson = (filePath: string, selectedColumns?: string[]): ConvertedRow[] => {
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 })

  if (jsonData.length > 0) {
    const headers = jsonData[0] as string[]
    const dataRows = jsonData.slice(1)

    const filteredHeaders = selectedColumns
      ? headers.filter(header => selectedColumns.includes(header))
      : headers

    return dataRows.map((row) => {
      const typedRow = row as CellValue[]
      const obj: ConvertedRow = {}
      filteredHeaders.forEach((header) => {
        obj[header] = typedRow[headers.indexOf(header)]
      })
      return obj
    })
  }
  return []
}

const csvFilePath = 'src/data/epi2024results.csv'
const outputJsonPath = 'src/data/epi2024results.json'
const columnsToInclude = ['country', 'EPI.new']

try {
  const jsonData = convertCsvToJson(csvFilePath, columnsToInclude)
  fs.writeFileSync(outputJsonPath, JSON.stringify(jsonData, null, 2))
  console.log('CSV to JSON conversion successful!')
}
catch (error) {
  console.error('Error during conversion:', error)
}
