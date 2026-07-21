#!/usr/bin/env node
import { existsSync, lstatSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const iosRoot = path.join(repoRoot, "apps", "ios");
const outputPath = path.join(iosRoot, "SwiftSources.input.xcfilelist");

const iosSourceRoots = [
  "Sources",
  "ShareExtension",
  "ActivityWidget",
  path.join("WatchApp", "Sources"),
];

const sharedSwiftFiles = [
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatComposer.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatCodeHighlighter.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatInlineMath.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatLinkPreview.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatMarkdownBlockSegmenter.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatMarkdownBlockViews.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatMarkdownPreprocessor.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatMarkdownRenderer.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatMessageViews.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatModelPickerStore.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatModels.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatPayloadDecoding.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatSessions.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatSheets.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatStreamingReveal.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatTheme.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatTranscriptCache.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatTransport.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatView.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatViewModel+Attachments.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatViewModel+SessionKeys.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatViewModel+TranscriptCache.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/ChatViewModel.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistChatUI/NodoAssistMascotView.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/AnyCodable.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/BonjourEscapes.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/BonjourTypes.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/BridgeFrames.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/CameraCommands.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/CanvasA2UIAction.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/CanvasA2UICommands.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/CanvasA2UIJSONL.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/CanvasCommandParams.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/CanvasCommands.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/Capabilities.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/DeepLinks.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/JPEGTranscoder.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/NodeError.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/NodoAssistKitResources.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/ScreenCommands.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/StoragePaths.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/SystemCommands.swift",
  "../shared/NodoAssistKit/Sources/NodoAssistKit/TalkDirective.swift",
  "../swabble/Sources/SwabbleKit/WakeWordGate.swift",
];

function normalizeFileListPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function collectSwiftFiles(rootRelativePath) {
  const root = path.join(iosRoot, rootRelativePath);
  if (!existsSync(root)) {
    throw new Error(`Missing iOS Swift source root: ${rootRelativePath}`);
  }

  const entries = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".swift")) {
        entries.push(normalizeFileListPath(path.relative(iosRoot, fullPath)));
      }
    }
  };
  visit(root);
  return entries;
}

function assertSharedFilesExist(filePaths) {
  for (const filePath of filePaths) {
    const absolutePath = path.resolve(iosRoot, filePath);
    if (!existsSync(absolutePath)) {
      throw new Error(`Missing shared Swift file listed for iOS lint: ${filePath}`);
    }
  }
}

function writeGeneratedFile(filePath, contents) {
  if (existsSync(filePath) && lstatSync(filePath).isSymbolicLink()) {
    throw new Error(`Refusing to overwrite symlinked file: ${filePath}`);
  }
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents, "utf8");
}

assertSharedFilesExist(sharedSwiftFiles);

const iosFiles = iosSourceRoots.flatMap(collectSwiftFiles);
const fileList = [...new Set([...iosFiles, ...sharedSwiftFiles])].toSorted((left, right) =>
  left.localeCompare(right),
);

writeGeneratedFile(outputPath, `${fileList.join("\n")}\n`);
process.stdout.write(`Prepared iOS Swift file list: ${path.relative(repoRoot, outputPath)}\n`);
