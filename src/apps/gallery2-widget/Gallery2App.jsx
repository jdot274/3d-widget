import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { gallery2Scenes as staticScenes } from '../../data/gallery2Scenes';

const LOCAL_KEY = 'gallery2ScenesUser';

function getUserScenes() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUserScenes(scenes) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(scenes));
}

export default function Gallery2App({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [userScenes, setUserScenes] = useState(getUserScenes());
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'spline',
    sceneUrl: ''
  });

  useEffect(() => {
    setUserScenes(getUserScenes());
  }, []);

  const allScenes = [...staticScenes, ...userScenes];

  function handleAddScene(e) {
    e.preventDefault();
    if (!form.name || !form.sceneUrl) return;
    const newScene = {
      id: `user-${Date.now()}`,
      name: form.name,
      description: form.description,
      type: form.type,
      sceneUrl: form.sceneUrl
    };
    const updated = [...userScenes, newScene];
    setUserScenes(updated);
    saveUserScenes(updated);
    setShowAdd(false);
    setForm({ name: '', description: '', type: 'spline', sceneUrl: '' });
  }

  if (selected) {
    const scene = allScenes.find(s => s.id === selected);
    return (
      <div style={{ width: '100vw', height: '100vh', background: 'transparent' }}>
        <button onClick={() => setSelected(null)}>Back to Gallery</button>
        {scene && scene.type === 'spline' && (
          <Spline scene={scene.sceneUrl} />
        )}
        {scene && scene.type === 'custom' && scene.component && (
          <scene.component />
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'transparent' }}>
      <button onClick={onBack}>Back</button>
      <button onClick={() => setShowAdd(true)} style={{ marginLeft: 16 }}>Add Scene</button>
      {showAdd && (
        <form onSubmit={handleAddScene} style={{ background: '#222', color: '#fff', padding: 24, borderRadius: 12, position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <h2>Add Spline Scene</h2>
          <div style={{ marginBottom: 12 }}>
            <label>Name:<br />
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ width: 300 }} />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Description:<br />
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: 300 }} />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Spline Scene URL:<br />
              <input value={form.sceneUrl} onChange={e => setForm(f => ({ ...f, sceneUrl: e.target.value }))} required style={{ width: 300 }} placeholder="https://prod.spline.design/.../scene.splinecode" />
            </label>
          </div>
          <button type="submit">Add</button>
          <button type="button" onClick={() => setShowAdd(false)} style={{ marginLeft: 12 }}>Cancel</button>
        </form>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 24 }}>
        {allScenes.length === 0 && (
          <div style={{ color: '#aaa', fontSize: 20 }}>No scenes in the gallery yet.</div>
        )}
        {allScenes.map(scene => (
          <div
            key={scene.id}
            style={{
              width: 300,
              height: 200,
              border: '1px solid #ccc',
              borderRadius: 12,
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#111',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => setSelected(scene.id)}
          >
            <div style={{ width: '100%', height: 120, background: '#222', overflow: 'hidden' }}>
              {scene.type === 'spline' && scene.sceneUrl && (
                <Spline scene={scene.sceneUrl} style={{ width: '100%', height: '100%' }} />
              )}
              {scene.type === 'custom' && scene.component && (
                <scene.component previewMode={true} style={{ width: '100%', height: '100%' }} />
              )}
            </div>
            <div style={{ padding: 12 }}>
              <h3 style={{ margin: 0, color: '#fff' }}>{scene.name}</h3>
              <p style={{ margin: 0, color: '#aaa' }}>{scene.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 