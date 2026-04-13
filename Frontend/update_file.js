import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'tickets', 'NewTicketPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetContent = `              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <UploadCloudIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SVG, PNG, JPG or GIF (max. 5MB)
                </p>
              </div>`;

const replacement = `              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/gif, image/svg+xml" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      setFilePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {!filePreview ? (
                  <>
                    <UploadCloudIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      SVG, PNG, JPG or GIF (max. 5MB)
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center relative z-0">
                    <img src={filePreview} alt="Preview" className="max-h-32 mb-2 rounded-md object-contain" />
                    <p className="text-sm font-medium text-brand-purple truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">Click or drag to replace</p>
                  </div>
                )}
              </div>`;

// Use regex to ignore line endings mismatch
const escapedTargetContent = targetContent.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\r?\\n\\s*/g, '\\\\s*');
const regex = new RegExp(escapedTargetContent);
content = content.replace(regex, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully.');
