import type { Route } from "./+types/libraries.$";
import { xprisma } from "~/utils/prisma.server";
import { createClient } from "~/utils/supabase.server";
import { redirect } from "react-router";
import { UploadFileForm } from "~/components/UploadFileForm";

export async function loader({ params }: Route.LoaderArgs) {
  const splat = params["*"] || "";
  const pathSegments = splat.split('/').filter(Boolean);

  try {
    if (pathSegments.length === 0) {
      const rootFolders = await xprisma.folder.findMany({
        where: { depth: 1 },
        include: { files: true }
      });
      return { folders: rootFolders, targetFolder: null, currentPath: "", error: null };
    }

    const displayPath = "/" + pathSegments.join("/");

    const targetFolder = await xprisma.folder.findFirst({
      where: { displayPath: displayPath },
      include: { files: true }
    });

    if (!targetFolder) {
      return { folders: [], targetFolder: null, currentPath: displayPath, error: "Folder not found" };
    }

    const childFolders = await xprisma.folder.findChildren({
      node: targetFolder
    });

    return {
      folders: childFolders,
      targetFolder,
      currentPath: displayPath,
      error: null
    };

  } catch (error) {
    return {
      folders: [],
      targetFolder: null,
      currentPath: splat,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "uploadFile") {
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string;

    if (!file || file.size === 0) {
      return { error: "Please select a file" };
    }

    try {
      const { supabase } = createClient(request);

      const fileName = file.name;
      const filePath = `uploads/${Date.now()}-${fileName}`;

      const { error } = await supabase.storage
        .from('CMS')
        .upload(filePath, file);

      if (error) {
        return { error: "Failed to upload file to storage" };
      }

      let fileDisplayPath = `/${fileName}`;
      if (folderId) {
        const folder = await xprisma.folder.findUnique({
          where: { id: folderId }
        });
        if (folder) {
          fileDisplayPath = `${folder.displayPath}/${fileName}`;
        }
      }

      await xprisma.file.create({
        data: {
          name: fileName,
          displayPath: fileDisplayPath,
          size: file.size,
          mimeType: file.type,
          extension: fileName.split('.').pop() || '',
          folderId: folderId || null,
          supabasePath: filePath,
          bucketName: 'CMS'
        }
      });

      return redirect(request.url);
    } catch (error) {
      return { error: "Failed to upload file" };
    }
  }

  return { error: "Invalid action" };
}

export default function Libraries({ loaderData }: Route.ComponentProps) {
  const { folders, targetFolder, currentPath, error } = loaderData;

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Libraries Path: {currentPath || "/"}</h1>

      {targetFolder && (
        <div>
          <h2>Current Folder: {targetFolder.name}</h2>

          <UploadFileForm
            folderId={targetFolder.id}
          />

          <div>Files in this folder:</div>
          {targetFolder.files.map((file, index) => (
            <div key={index}>
              {file.name}
            </div>
          ))}
        </div>
      )}

      <div>
        <h2>Subfolders:</h2>
        {folders?.map((folder, index) => (
          <div key={index}>
            <a href={`/libraries${folder.displayPath}`}>{folder.name}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
