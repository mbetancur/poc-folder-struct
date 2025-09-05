import type { Route } from "./+types/home";
import { createClient } from "~/utils/supabase.server";
import { createRootFolder, createChildFolder, getAllRootFolders } from "~/utils/folder.server";
import { redirect } from "react-router";
import { CreateFolderForm } from "~/components/CreateFolderForm";
import { CreateChildFolderForm } from "~/components/CreateChildFolderForm";
import { useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const folders = await getAllRootFolders();

    const { supabase } = createClient(request);
    const { data: supabaseFiles } = await supabase.storage
      .from('CMS')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    return {
      folders,
      supabaseFiles: supabaseFiles || [],
      error: null
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      folders: [],
      supabaseFiles: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

    if (intent === "createRootFolder") {
    const folderName = formData.get("folderName") as string;

    try {
      await createRootFolder(folderName);
      return redirect("/");
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : "Failed to create folder" 
      };
    }
  }

  if (intent === "createChildFolder") {
    const parentFolderId = formData.get("parentFolderId") as string;
    const childFolderName = formData.get("childFolderName") as string;

    try {
      const newFolder = await createChildFolder(parentFolderId, childFolderName);
      console.log('New child folder created:', newFolder);
      return redirect("/");
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : "Failed to create child folder" 
      };
    }
  }

  return { error: "Invalid action" };
}

function FolderList({ folders }: { folders: any[] }) {
  if (folders.length === 0) {
    return <p>No folders found.</p>;
  }

  return (
    <div>
      {folders.map((folder) => (
        <div key={folder.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee' }}>
          <div style={{ fontWeight: 'bold' }}>
            📁 {folder.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Path: {folder.displayPath} | Depth: {folder.depth} | Children: {folder.numchild}
          </div>
          {folder.files.length > 0 && (
            <div style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {folder.files.map((file: any) => (
                <div key={file.id} style={{ fontSize: '14px', color: '#555' }}>
                  📄 {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { folders, supabaseFiles, error } = loaderData;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateChildForm, setShowCreateChildForm] = useState(false);

  if (error) {
    return (
      <div>
        <h1>Error loading data</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Content Library</h1>

      <div style={{ marginBottom: '30px' }}>
        {/* <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Root Folder'}
        </button> */}
        
        <button
          onClick={() => alert('Upload file functionality coming soon!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Upload File
        </button>
        
        <button
          onClick={() => setShowCreateChildForm(!showCreateChildForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showCreateChildForm ? 'Cancel' : 'Create Folder'}
        </button>
      </div>

      {showCreateForm && (
        <CreateFolderForm onCancel={() => setShowCreateForm(false)} />
      )}

      {showCreateChildForm && (
        <CreateChildFolderForm 
          folders={folders} 
          onCancel={() => setShowCreateChildForm(false)} 
        />
      )}

      <div style={{ marginBottom: '40px' }}>
        <h2>Root Folders</h2>
        <FolderList folders={folders} />
      </div>

      <div>
        <h2>Supabase Storage</h2>
        {supabaseFiles.length === 0 ? (
          <p>No files found in Supabase storage.</p>
        ) : (
          <div>
            {supabaseFiles.map((item: any, index: number) => (
              <div key={`${item.name}-${index}`} style={{ marginBottom: '5px' }}>
                {item.metadata ? '📁' : '📄'} {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}