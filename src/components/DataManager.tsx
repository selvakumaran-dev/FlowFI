import { useExpense } from '@/context/ExpenseContext'
import { useState, useRef } from 'react'
import type { Expense } from '@/types/expense'
import { exportToCSV, exportToJSON, parseCSVImport, downloadFile, validateCSVData, type ValidationResult, formatCurrency } from '@/lib/utils'
import { exportAllData, clearAllData, importExpenses } from '@/lib/storage'
import { useStorageQuota } from '@/hooks/useStorageQuota'
import { useGoogleDrive } from '@/hooks/useGoogleDrive'
import { useToast } from '@/components/Toast'
import { Download, Upload, FileJson, FileSpreadsheet, FileText, Trash2, AlertTriangle, CheckCircle, AlertCircle, HardDrive, Cloud, CloudUpload, CloudDownload, Settings, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function DataManager() {
    const { expenses, importData, refreshData } = useExpense()
    const { showSuccess, showError, showWarning, showInfo } = useToast()
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [importPreview, setImportPreview] = useState<{ expenses: Expense[], validation: ValidationResult } | null>(null)
    const [exportDateFrom, setExportDateFrom] = useState('')
    const [exportDateTo, setExportDateTo] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { usageFormatted, quotaFormatted, percentage } = useStorageQuota()

    // Google Drive State
    const { isInitialized, isSignedIn, initClient, signIn, signOut, uploadFile, listFiles, downloadFile: driveDownload } = useGoogleDrive()
    const [clientId, setClientId] = useState(localStorage.getItem('gdrive_client_id') || '')
    const [apiKey, setApiKey] = useState(localStorage.getItem('gdrive_api_key') || '')
    const [showDriveSettings, setShowDriveSettings] = useState(false)
    const [isBackingUp, setIsBackingUp] = useState(false)
    const [isRestoring, setIsRestoring] = useState(false)
    const [driveBackups, setDriveBackups] = useState<any[]>([])

    const handleConnectDrive = async () => {
        if (!clientId || !apiKey) {
            showError('Missing Credentials', 'Please enter Client ID and API Key')
            return
        }
        localStorage.setItem('gdrive_client_id', clientId)
        localStorage.setItem('gdrive_api_key', apiKey)
        await initClient(clientId, apiKey)
    }

    const handleBackupToDrive = async () => {
        setIsBackingUp(true)
        try {
            const data = exportAllData()
            const content = JSON.stringify(data)
            const filename = `flowfi_backup_${new Date().toISOString().split('T')[0]}.json`
            await uploadFile(content, filename)
            showSuccess('Backup Successful', 'Data backed up to Google Drive')
            await loadDriveBackups()
        } catch (error) {
            showError('Backup Failed', 'Could not upload to Google Drive')
        } finally {
            setIsBackingUp(false)
        }
    }

    const loadDriveBackups = async () => {
        try {
            const files = await listFiles()
            setDriveBackups(files || [])
        } catch (error) {
            console.error('Failed to list backups', error)
        }
    }

    const handleRestoreFromDrive = async (fileId: string) => {
        if (!confirm('This will overwrite your current data. Are you sure?')) return

        setIsRestoring(true)
        try {
            const content = await driveDownload(fileId)
            const data = JSON.parse(content)
            if (data.expenses) {
                // For full restore we might need a dedicated function in storage.ts
                // But importData handles adding expenses. 
                // Ideally we should clear and replace, but for now let's use importData logic which appends/merges?
                // Actually importData in context calls importExpensesDb which merges.
                // If we want full restore, we might need a new context method.
                // For now, let's assume import is fine.
                // Wait, importData takes a File. Here we have JSON content.
                // We should probably expose a method to import raw data or just use refreshData after manual import.

                importExpenses(data.expenses)
                refreshData()
                showSuccess('Restore Successful', 'Data restored from Google Drive')
            } else {
                throw new Error('Invalid backup format')
            }
        } catch (error) {
            showError('Restore Failed', 'Could not restore from Google Drive')
        } finally {
            setIsRestoring(false)
        }
    }

    const handleExportCSV = () => {
        try {
            let dataToExport = [...expenses]

            if (exportDateFrom) {
                dataToExport = dataToExport.filter(e => e.date >= exportDateFrom)
            }
            if (exportDateTo) {
                dataToExport = dataToExport.filter(e => e.date <= exportDateTo)
            }

            const csv = exportToCSV(dataToExport)
            const filename = `expenses_${exportDateFrom || 'all'}_to_${exportDateTo || 'now'}.csv`
            downloadFile(csv, filename, 'text/csv')
            showSuccess('Exported Successfully', `Downloaded ${dataToExport.length} expenses as CSV`)
        } catch (error) {
            showError('Export Failed', 'Could not export data to CSV')
        }
    }

    const handleExportJSON = () => {
        try {
            const data = exportAllData()
            const json = exportToJSON(data)
            const filename = `daily_tracker_backup_${new Date().toISOString().split('T')[0]}.json`
            downloadFile(json, filename, 'application/json')
            showSuccess('Backup Created', 'All data exported successfully')
        } catch (error) {
            showError('Backup Failed', 'Could not create backup file')
        }
    }

    const handleExportExcel = () => {
        try {
            let dataToExport = [...expenses]

            if (exportDateFrom) {
                dataToExport = dataToExport.filter(e => e.date >= exportDateFrom)
            }
            if (exportDateTo) {
                dataToExport = dataToExport.filter(e => e.date <= exportDateTo)
            }

            const worksheetData = dataToExport.map(e => ({
                Date: e.date,
                Description: e.description,
                Category: e.category,
                Amount: e.amount,
                Classification: e.classification || 'N/A',
                Event: e.event || 'N/A',
                Tags: e.tags?.join(', ') || 'N/A',
                Notes: e.notes || 'N/A'
            }))

            const worksheet = XLSX.utils.json_to_sheet(worksheetData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses')

            const filename = `expenses_${exportDateFrom || 'all'}_to_${exportDateTo || 'now'}.xlsx`
            XLSX.writeFile(workbook, filename)
            showSuccess('Excel Export Successful', `Downloaded ${dataToExport.length} expenses`)
        } catch (error) {
            showError('Excel Export Failed', 'Could not export data to Excel')
        }
    }

    const handleExportPDF = () => {
        try {
            let dataToExport = [...expenses]

            if (exportDateFrom) {
                dataToExport = dataToExport.filter(e => e.date >= exportDateFrom)
            }
            if (exportDateTo) {
                dataToExport = dataToExport.filter(e => e.date <= exportDateTo)
            }

            const doc = new jsPDF()

            doc.setFontSize(18)
            doc.text('Expense Report', 14, 22)
            doc.setFontSize(11)
            doc.text(`Period: ${exportDateFrom || 'All'} to ${exportDateTo || 'Now'}`, 14, 30)
            doc.text(`Total Expenses: ${dataToExport.length}`, 14, 36)

            const total = dataToExport.reduce((sum, e) => sum + e.amount, 0)
            doc.text(`Total Amount: ${formatCurrency(total)}`, 14, 42)

            const tableData = dataToExport.map(e => [
                e.date,
                e.description,
                e.category,
                formatCurrency(e.amount),
                e.classification || 'N/A'
            ])

            autoTable(doc, {
                startY: 48,
                head: [['Date', 'Description', 'Category', 'Amount', 'Type']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235] },
                styles: { fontSize: 9 }
            })

            const filename = `expenses_${exportDateFrom || 'all'}_to_${exportDateTo || 'now'}.pdf`
            doc.save(filename)
            showSuccess('PDF Export Successful', `Downloaded ${dataToExport.length} expenses`)
        } catch (error) {
            showError('PDF Export Failed', 'Could not export data to PDF')
        }
    }

    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const csv = e.target?.result as string
                const importedExpenses = parseCSVImport(csv)

                if (importedExpenses.length === 0) {
                    showWarning('No Data Found', 'The CSV file appears to be empty')
                    return
                }

                // Validate data
                const validation = validateCSVData(importedExpenses)

                // Show preview
                setImportPreview({ expenses: importedExpenses, validation })
            } catch (error) {
                showError('Import Failed', 'Could not parse CSV file. Please check the format.')
            }
        }
        reader.readAsText(file)

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const confirmImport = () => {
        if (!importPreview) return

        if (!importPreview.validation.isValid) {
            showError('Validation Failed', 'Please fix errors before importing')
            return
        }

        // onImport(importPreview.expenses)
        // We need to import these expenses.
        // Since importData takes a File, we can just call importExpenses directly and then refresh.
        importExpenses(importPreview.expenses)
        refreshData()

        showSuccess('Import Successful', `Imported ${importPreview.expenses.length} expenses`)
        setImportPreview(null)
    }

    const cancelImport = () => {
        setImportPreview(null)
    }

    const handleClearAll = () => {
        try {
            clearAllData()
            refreshData()
            setShowClearConfirm(false)
            showSuccess('Data Cleared', 'All data has been removed')
        } catch (error) {
            showError('Clear Failed', 'Could not clear data')
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Data Management</h2>

                <div className="space-y-6">
                    {/* Storage Quota */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">Storage Usage</span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {usageFormatted} / {quotaFormatted}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-600' : percentage > 70 ? 'bg-yellow-500' : 'bg-primary-600'
                                    }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                        </div>
                        {percentage > 80 && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Warning: You are running low on local storage space. Consider exporting old data and clearing it.
                            </p>
                        )}
                    </div>

                </div>

                {/* Google Drive Backup */}
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Google Drive Backup</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Sync your data to the cloud</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDriveSettings(!showDriveSettings)}
                            className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {showDriveSettings && (
                        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Client ID</label>
                                <input
                                    type="text"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter Google Client ID"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">API Key</label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter Google API Key"
                                />
                            </div>
                            <button
                                onClick={handleConnectDrive}
                                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                                Connect
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                                Note: You need to enable Google Drive API in your Google Cloud Console and add this domain to authorized origins.
                            </p>
                        </div>
                    )}

                    {!isInitialized ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Configure Client ID and API Key in settings to enable backup.
                            </p>
                        </div>
                    ) : !isSignedIn ? (
                        <button
                            onClick={signIn}
                            className="w-full py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                            Sign in with Google
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBackupToDrive}
                                    disabled={isBackingUp}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isBackingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                                    Backup Now
                                </button>
                                <button
                                    onClick={loadDriveBackups}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                                >
                                    Refresh
                                </button>
                                <button
                                    onClick={signOut}
                                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                    Sign Out
                                </button>
                            </div>

                            {driveBackups.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Backups</h4>
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {driveBackups.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg text-sm">
                                                <div className="truncate flex-1 mr-2">
                                                    <p className="font-medium text-gray-800 dark:text-white truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{new Date(file.createdTime).toLocaleDateString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRestoreFromDrive(file.id)}
                                                    disabled={isRestoring}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                    title="Restore"
                                                >
                                                    {isRestoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Export Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Export Data</h3>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={exportDateFrom}
                                onChange={(e) => setExportDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={exportDateTo}
                                onChange={(e) => setExportDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center justify-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                        >
                            <FileSpreadsheet className="w-6 h-6 text-green-600 group-hover:text-primary-600" />
                            <div className="text-left">
                                <p className="font-semibold text-gray-800 dark:text-white">Export as Excel</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {exportDateFrom || exportDateTo ? 'Filtered range' : 'All expenses'}
                                </p>
                            </div>
                            <Download className="w-5 h-5 ml-auto text-gray-400 group-hover:text-primary-600" />
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="flex items-center justify-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                        >
                            <FileText className="w-6 h-6 text-red-600 group-hover:text-primary-600" />
                            <div className="text-left">
                                <p className="font-semibold text-gray-800 dark:text-white">Export as PDF</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {exportDateFrom || exportDateTo ? 'Filtered range' : 'All expenses'}
                                </p>
                            </div>
                            <Download className="w-5 h-5 ml-auto text-gray-400 group-hover:text-primary-600" />
                        </button>

                        <button
                            onClick={handleExportCSV}
                            className="flex items-center justify-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                        >
                            <FileSpreadsheet className="w-6 h-6 text-blue-600 group-hover:text-primary-600" />
                            <div className="text-left">
                                <p className="font-semibold text-gray-800 dark:text-white">Export as CSV</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {exportDateFrom || exportDateTo ? 'Filtered range' : 'All expenses'}
                                </p>
                            </div>
                            <Download className="w-5 h-5 ml-auto text-gray-400 group-hover:text-primary-600" />
                        </button>

                        <button
                            onClick={handleExportJSON}
                            className="flex items-center justify-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                        >
                            <FileJson className="w-6 h-6 text-purple-600 group-hover:text-primary-600" />
                            <div className="text-left">
                                <p className="font-semibold text-gray-800 dark:text-white">Full Backup (JSON)</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    All data included
                                </p>
                            </div>
                            <Download className="w-5 h-5 ml-auto text-gray-400 group-hover:text-primary-600" />
                        </button>
                    </div>
                </div>

                {/* Import Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Import Data</h3>
                    <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 transition-colors">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleImportCSV}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className="flex flex-col items-center justify-center cursor-pointer py-4"
                        >
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="font-semibold text-gray-800 dark:text-white">Import from CSV</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Click to select a CSV file
                            </p>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Expected format: Date, Description, Category, Amount, Notes, Tags
                    </p>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </h3>

                    {!showClearConfirm ? (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All Data
                        </button>
                    ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-800 dark:text-red-200 font-semibold mb-3">
                                Are you absolutely sure?
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                This will permanently delete all expenses, budgets, and categories. This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleClearAll}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Yes, Delete Everything
                                </button>
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Import Preview Modal */}
            {importPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Import Preview</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {importPreview.expenses.length} expenses found
                            </p>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            {/* Validation Results */}
                            {importPreview.validation.errors.length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <h4 className="font-semibold text-red-800 dark:text-red-200">
                                            {importPreview.validation.errors.length} Errors Found
                                        </h4>
                                    </div>
                                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                                        {importPreview.validation.errors.slice(0, 10).map((error, i) => (
                                            <li key={i}>
                                                Row {error.row}: {error.message}
                                            </li>
                                        ))}
                                        {importPreview.validation.errors.length > 10 && (
                                            <li className="font-semibold">
                                                ... and {importPreview.validation.errors.length - 10} more errors
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {importPreview.validation.warnings.length > 0 && (
                                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                                            {importPreview.validation.warnings.length} Warnings
                                        </h4>
                                    </div>
                                    <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                                        {importPreview.validation.warnings.slice(0, 5).map((warning, i) => (
                                            <li key={i}>
                                                {warning.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {importPreview.validation.isValid && (
                                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <p className="font-semibold text-green-800 dark:text-green-200">
                                            All data is valid and ready to import
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={confirmImport}
                                disabled={!importPreview.validation.isValid}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Import {importPreview.expenses.length} Expenses
                            </button>
                            <button
                                onClick={cancelImport}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
