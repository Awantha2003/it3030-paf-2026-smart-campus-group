import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'UserDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Replace lines 183 to 192 (0-indexed, so 184 to 193)
const replacement = `                <div className="z-10 flex flex-col gap-2 relative mt-4 md:mt-0">
                    <div className="flex gap-4">
                        <Button 
                            variant="secondary" 
                            onClick={handleEmergency}
                            disabled={isEmergencyLoading}
                            className="bg-red-500 hover:bg-red-600 border-none text-white shadow-lg shadow-red-500/40 relative overflow-hidden group"
                            leftIcon={
                                <div className="relative">
                                    <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></span>
                                    <FiAlertTriangle className="relative w-5 h-5" />
                                </div>
                            }
                        >
                            <span className="relative z-10 font-bold">
                                {isEmergencyLoading ? 'Dispatching...' : 'Emergency'}
                            </span>
                            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => navigate(studentRoutes.newTicket)}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white shadow-sm"
                            leftIcon={<FiAlertCircle className="w-5 h-5" />}
                        >
                            Report Issue
                        </Button>
                    </div>
                    {emergencyStatus && (
                        <p className="text-white text-sm font-medium absolute -bottom-6 w-full whitespace-nowrap drop-shadow-sm flex items-center justify-center">
                            {emergencyStatus}
                        </p>
                    )}
                </div>`;

lines.splice(183, 10, replacement);
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('File updated successfully.');
