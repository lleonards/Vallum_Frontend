import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEditorStore } from '@/store/editorStore'
import { useThemeStore } from '@/store/themeStore'
import EditorTopBar from '@/components/editor/EditorTopBar'
import EditorToolbar from '@/components/toolbar/EditorToolbar'
import EditorCanvas from '@/components/editor/EditorCanvas'
import EditorSidebar from '@/components/sidebar/EditorSidebar'
import PropertiesPanel from '@/components/editor/PropertiesPanel'
import ConversionModal from '@/components/modals/ConversionModal'
import PageOrientationModal from '@/components/modals/PageOrientationModal'
import UploadModal from '@/components/modals/UploadModal'
import toast from 'react-hot-toast'

export default function EditorPage() {
  const { isDark } = useThemeStore()
  const {
    pdfFile, pdfBytes, showSidebar, showProperties,
    isLoading, setPdfBytes, setPdfName, setTotalPages, setPages,
    setLoading, currentPage, pages
  } = useEditorStore()
  const navigate = useNavigate()
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [showOrientationModal, setShowOrientationModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    if (!pdfBytes && !pdfFile) {
      setShowUploadModal(true)
    }
  }, [pdfBytes, pdfFile])

  return (
    <div className={`${isDark ? 'dark' : ''} h-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-dark-950`}>
      {/* Top Bar */}
      <EditorTopBar
        onConvert={() => setShowConversionModal(true)}
        onOrient={() => setShowOrientationModal(true)}
        onUpload={() => setShowUploadModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {showSidebar && <EditorSidebar />}

        {/* Main editor area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Toolbar */}
          <EditorToolbar />

          {/* Canvas */}
          <div className="flex flex-1 overflow-hidden">
            <EditorCanvas />
            {/* Right Properties Panel */}
            {showProperties && <PropertiesPanel />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showConversionModal && (
        <ConversionModal onClose={() => setShowConversionModal(false)} />
      )}
      {showOrientationModal && (
        <PageOrientationModal onClose={() => setShowOrientationModal(false)} />
      )}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  )
}
