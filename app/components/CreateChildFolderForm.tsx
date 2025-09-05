import { Form } from "react-router";

interface CreateChildFolderFormProps {
  folders: any[];
  onCancel: () => void;
}

export function CreateChildFolderForm({ folders, onCancel }: CreateChildFolderFormProps) {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '20px', 
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
      marginBottom: '20px'
    }}>
      <h3>Create Child Folder</h3>
      
      <Form method="post">
        <input type="hidden" name="intent" value="createChildFolder" />
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="parentFolderId" style={{ display: 'block', marginBottom: '5px' }}>
            Parent Folder:
          </label>
          <select
            name="parentFolderId"
            id="parentFolderId"
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="">Select a parent folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.displayPath} ({folder.name})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="childFolderName" style={{ display: 'block', marginBottom: '5px' }}>
            Folder Name:
          </label>
          <input
            type="text"
            name="childFolderName"
            id="childFolderName"
            required
            placeholder="Enter folder name..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create Child Folder
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </Form>
    </div>
  );
}
