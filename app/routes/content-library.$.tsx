import type { Route } from "./+types/content-library.$";
import { redirect } from "react-router";

import { xprisma } from "~/utils/prisma.server";
import ColumnsSlider from "~/components/ColumnsSlider";
import ContentActions from "~/components/ContentActions";

export interface BarkNode {
  id: string;
  name: string;
  path: string;
  depth: number;
  numchild: number;
  isFolder: boolean;
  displayPath: string;
}

export async function loader({ params }: Route.LoaderArgs) {
  const splat = params["*"] || "";
  const childPathQueue: string[] = [];
  const pathSegments = splat.split('/').filter(Boolean);

  pathSegments.forEach((segment) => {
    if (childPathQueue.length > 0) {
      childPathQueue.push(childPathQueue[childPathQueue.length - 1] + "/" + segment);
      return;
    }
    childPathQueue.push("/" + segment);
  })

  // TODO: add bussines rules to validate the first path segment is the root folder
  try {
    const rootFolder: BarkNode | null = await xprisma.barkNode.findLastRoot();

    if (!rootFolder) {
      return {
        rootFolder: null,
        nodes: [],
        files: [],
        error: "Root folder not found"
      };
    }

    const nodeStructure: BarkNode[][] = []; // TODO better data structure for this

    let currentParent = rootFolder;
    while (childPathQueue.length >= 0) {
      const nodes: BarkNode[] | null = await xprisma.barkNode.findChildren({
        node: currentParent,
        select: {
          id: true,
          name: true,
          isFolder: true,
          path: true,
          depth: true,
          numchild: true,
          displayPath: true,
        }
      });
      if (nodes) {
        nodeStructure.push(nodes);
      }
      else if (currentParent.isFolder && currentParent.numchild === 0) {
        nodeStructure.push([]);
      }
      let nextSegment = childPathQueue.shift();
      // TODO: Improve this condition, skiping the root childs
      if (nextSegment === "/cms") nextSegment = childPathQueue.shift();

      const nextNode = nodes?.find((node) => node.displayPath === nextSegment);
      if (nextNode) {
        currentParent = nextNode;
      } else {
        // TODO: handle this case maybe we should throw an error + notification
        // Path doesn't exist, break out of loop? 
        break;
      }
    }

    const currentActiveFolder = currentParent;

    return {
      rootFolder: rootFolder,
      currentActiveFolder: currentActiveFolder,
      nodeStructure,
      error: null
    };

  } catch (error) {
    return {
      rootFolder: null,
      currentActiveFolder: null,
      nodeStructure: [],
      error: error instanceof Error ? error.message : 'Error fetching content library data'
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parentId = formData.get("parentId") as string;
  const displayPath = formData.get("displayPath") as string;
  const intent = formData.get("intent") as string;

  try {
    const futureParentNode = await xprisma.barkNode.findUnique({
      where: { id: parentId },
    });

    if (!futureParentNode) {
      throw new Error("Parent node not found");
    }

    let child;

    if (intent === "create-folder") {
      const newDisplayPath = `${displayPath}/New Folder`;
      child = await xprisma.barkNode.createChild({
        node: futureParentNode,
        data: { name: "New Folder", isFolder: true, displayPath: newDisplayPath }
      });
      console.log("Successfully created folder:", child);
    } else if (intent === "upload-file") {
      const newDisplayPath = `${displayPath}/new-file.txt`;
      child = await xprisma.barkNode.createChild({
        node: futureParentNode,
        data: { name: "new-file.txt", isFolder: false, displayPath: newDisplayPath }
      });
      console.log("Successfully created file:", child);
    } else {
      throw new Error("Invalid intent");
    }

    return redirect(request.url);
  } catch (error) {
    console.error("Error in action:", error);
    return { error: error instanceof Error ? error.message : `Failed to ${intent === "create-folder" ? "create folder" : "upload file"}` };
  }
}

export default function ContentLibrary({ loaderData }: Route.ComponentProps) {
  const { rootFolder, currentActiveFolder, nodeStructure, error } = loaderData;
  console.log("nodeStructure", nodeStructure);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!rootFolder) {
    return <div>Root folder not found</div>;
  }

  if (!currentActiveFolder) {
    return <div>Current folder not found</div>;
  }

  return (
    <div>
      <h1>Content Library </h1>
      <ContentActions parentNode={currentActiveFolder} />
      <ColumnsSlider rootFolder={rootFolder} nodes={nodeStructure || []} />
    </div>
  );
}