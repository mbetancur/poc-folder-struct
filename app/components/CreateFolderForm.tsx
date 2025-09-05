import { Form } from "react-router";

interface CreateFolderFormProps {
  onCancel: () => void;
}

export function CreateFolderForm({ onCancel }: CreateFolderFormProps) {
  return (

    <Form method="post" className="mb-4">
      <input type="hidden" name="intent" value="createRootFolder" />

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="folderName" style={{ display: 'block', marginBottom: '5px' }}>
          Folder Name:
        </label>
        <input
          type="text"
          name="folderName"
          id="folderName"
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
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Folder
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
  );
}
