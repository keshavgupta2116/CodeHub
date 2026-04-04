import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor  from '@monaco-editor/react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Play, ArrowLeft } from 'lucide-react';

const LANGS = ['python','javascript','typescript','html','css','java','cpp','c','go','rust','sql','json','markdown','bash'];
const DEFAULT_FILE = { name: 'main.py', content: '# Welcome to CodeHub Editor\n\nprint("Hello, World!")\n' };

export default function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([DEFAULT_FILE]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [language, setLanguage] = useState('python');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [projectDesc, setProjectDesc] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      api.get(`/projects/${projectId}`).then(res => {
        const p = res.data;
        setProject(p);
        setProjectName(p.name);
        setProjectDesc(p.description);
        setLanguage(p.language);
        setFiles(p.files?.length ? p.files : [DEFAULT_FILE]);
      }).catch(() => toast.error('Could not load project'));
    }
  }, [projectId]);

  const activeFile = files[activeIdx] || DEFAULT_FILE;

  const updateFileContent = (val) => {
    setFiles(prev => prev.map((f, i) => i === activeIdx ? { ...f, content: val } : f));
  };

  const addFile = () => {
    const name = prompt('File name:');
    if (!name) return;
    setFiles(prev => [...prev, { name, content: '' }]);
    setActiveIdx(files.length);
  };

  const removeFile = (idx) => {
    if (files.length === 1) return;
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setActiveIdx(Math.max(0, idx - 1));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (project) {
        await api.put(`/projects/${project.id}`, { name: projectName, description: projectDesc, language, files });
        toast.success('Project saved!');
      } else {
        setShowNewProject(true);
      }
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const createProject = async () => {
    setSaving(true);
    try {
      const res = await api.post('/projects/', { name: projectName, description: projectDesc, language, files });
      toast.success('Project created!');
      navigate(`/editor/${res.data.id}`);
      setShowNewProject(false);
    } catch { toast.error('Failed to create project'); }
    setSaving(false);
  };

  return (
    <div className="editor-shell animate-fade">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></button>

        <input
          className="input" style={{ maxWidth: 200, padding: '5px 10px', fontSize: '0.85rem' }}
          value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name"
        />

        <select className="input" style={{ maxWidth: 140, padding: '5px 10px', fontSize: '0.82rem' }}
          value={language} onChange={e => setLanguage(e.target.value)}>
          {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <div style={{ flex: 1 }} />

        {/* File tabs */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto' }}>
          {files.map((f, i) => (
            <div key={i} className={`file-tab ${i === activeIdx ? 'active' : ''}`}
              onClick={() => setActiveIdx(i)}>
              {f.name}
              {files.length > 1 && (
                <span onClick={e => { e.stopPropagation(); removeFile(i); }}
                  style={{ marginLeft: 4, opacity: 0.6, fontSize: '0.7rem' }}>✕</span>
              )}
            </div>
          ))}
          <button className="btn-icon btn-sm" onClick={addFile} title="Add file"><Plus size={14} /></button>
        </div>

        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Save size={14} /> Save</>}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="editor-wrapper">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={activeFile.content}
          onChange={updateFileContent}
          theme="vs-dark"
          onMount={ed => { editorRef.current = ed; }}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 20 },
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            renderLineHighlight: 'all',
            smoothScrolling: true,
          }}
        />
      </div>

      {/* New project modal */}
      {showNewProject && (
        <div className="modal-overlay" onClick={() => setShowNewProject(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Save as New Project</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Project Name</label>
                <input className="input" value={projectName} onChange={e => setProjectName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea className="input" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} rows={3} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost w-full" onClick={() => setShowNewProject(false)}>Cancel</button>
                <button className="btn btn-primary w-full" onClick={createProject} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
