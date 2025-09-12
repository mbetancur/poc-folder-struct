import { xprisma } from "~/utils/prisma.server";
import type { Route } from "../+types/root";
import { useActionData } from "react-router";
import { useState, useEffect } from "react";


export async function loader() {
  const rootFolder = await xprisma.folder.findFirst({
    where: { path: '0001' },
    select: { 
      id: true,
      path: true, 
      name: true, 
      displayPath: true,
      depth: true,
      numchild: true
    }
  })

  return { rootFolder }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "fetchChildren") {
    const folderId = formData.get("folderId") as string;

    if (!folderId) {
      return { error: "Folder ID is required" };
    }

    try {
      const folder = await xprisma.folder.findUnique({
        where: { id: folderId },
        select: { 
          id: true,
          path: true, 
          name: true, 
          displayPath: true,
          depth: true,
          numchild: true
        }
      });

      if (!folder) {
        return { error: "Folder not found" };
      }

      const children = await xprisma.folder.findChildren({
        node: folder
      });

      const files = await xprisma.file.findMany({
        where: { folderId: folderId },
        select: {
          id: true,
          name: true,
          size: true,
          mimeType: true,
          extension: true
        },
        orderBy: { name: 'asc' }
      });

      return { 
        children,
        files,
        currentFolder: folder,
        error: null
      };

    } catch (error) {
      return { error: "Failed to fetch folder children" };
    }
  }

  return { error: "Invalid action" };
}

interface FolderType {
  id: string;
  path: string;
  name: string;
  displayPath: string;
  depth: number;
  numchild: number;
}

interface FileType {
  id: string;
  name: string;
  size: number | null;
  mimeType: string | null;
  extension: string | null;
}

export default function SecondNavigation({ loaderData }: Route.ComponentProps) {
  const { rootFolder } = loaderData || { rootFolder: null as FolderType | null }
  const actionData = useActionData<typeof action>()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null)
  const [children, setChildren] = useState<FolderType[]>([])
  const [files, setFiles] = useState<FileType[]>([])
  const [breadcrumb, setBreadcrumb] = useState<FolderType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (actionData?.children && actionData?.currentFolder) {
      setChildren(actionData.children)
      setFiles(actionData.files || [])
      setCurrentFolder(actionData.currentFolder)
      setIsLoading(false)
      
      if (breadcrumb.length === 0 || breadcrumb[breadcrumb.length - 1]?.id !== actionData.currentFolder.id) {
        setBreadcrumb(prev => [...prev, actionData.currentFolder])
      }
    }
  }, [actionData, breadcrumb])

  const openModal = (folder: FolderType) => {
    setIsModalOpen(true)
    setCurrentFolder(folder)
    setBreadcrumb([folder])
    fetchChildren(folder.id)
  }

  const fetchChildren = (folderId: string) => {
    setIsLoading(true)
    const form = document.createElement('form')
    form.method = 'POST'
    form.style.display = 'none'
    
    const intentInput = document.createElement('input')
    intentInput.name = 'intent'
    intentInput.value = 'fetchChildren'
    form.appendChild(intentInput)
    
    const folderIdInput = document.createElement('input')
    folderIdInput.name = 'folderId'
    folderIdInput.value = folderId
    form.appendChild(folderIdInput)
    
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  const navigateToFolder = (folder: FolderType) => {
    const folderIndex = breadcrumb.findIndex(f => f.id === folder.id)
    if (folderIndex >= 0) {
      setBreadcrumb(breadcrumb.slice(0, folderIndex + 1))
    } else {
      setBreadcrumb(prev => [...prev, folder])
    }
    
    setCurrentFolder(folder)
    fetchChildren(folder.id)
  }

  const navigateToBreadcrumb = (folder: FolderType, index: number) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1))
    setCurrentFolder(folder)
    fetchChildren(folder.id)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentFolder(null)
    setChildren([])
    setFiles([])
    setBreadcrumb([])
    setIsLoading(false)
  }

  if (!rootFolder) {
    return <div>No root folder found</div>
  }

  return (
    <div>
      <div onClick={() => openModal(rootFolder)}>
        <div>{rootFolder.name}</div>
        <div>{rootFolder.displayPath}</div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold">
                  {currentFolder?.name || 'Folder Contents'}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  {breadcrumb.map((folder, index) => (
                    <div key={folder.id} className="flex items-center">
                      {index > 0 && <span className="mx-1">/</span>}
                      <button
                        onClick={() => navigateToBreadcrumb(folder, index)}
                        className="hover:text-blue-600 hover:underline"
                        disabled={index === breadcrumb.length - 1}
                      >
                        {folder.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {actionData?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  Error: {actionData.error}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600">Loading...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Folders ({children.length})
                    </h3>
                    <div className="space-y-2">
                      {children.length > 0 ? (
                        children.map((folder) => (
                          <div
                            key={folder.id}
                            onClick={() => navigateToFolder(folder)}
                            className="p-3 border border-gray-300 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-colors"
                          >
                            <div className="font-medium flex items-center">
                              <span className="mr-2">📁</span>
                              {folder.name}
                            </div>
                            <div className="text-sm text-gray-600">{folder.displayPath}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 italic">No subfolders</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Files ({files.length})
                    </h3>
                    <div className="space-y-2">
                      {files.length > 0 ? (
                        files.map((file) => (
                          <div key={file.id} className="p-3 border border-gray-300 rounded bg-gray-50">
                            <div className="font-medium flex items-center">
                              <span className="mr-2">📄</span>
                              {file.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              Size: {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Type: {file.mimeType || 'Unknown'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 italic">No files</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 