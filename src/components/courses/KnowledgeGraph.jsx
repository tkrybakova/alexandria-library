import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Sparkles } from 'lucide-react';

export default function KnowledgeGraph({ courses, onCourseSelect, userProgress = {}, userFacultyId }) {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!courses.length) return;

    const width = 800;
    const height = 600;
    
    // Create nodes with physics simulation
    const newNodes = courses.map((course, i) => {
      const angle = (i / courses.length) * 2 * Math.PI;
      const radius = 200;
      return {
        id: course.id,
        course,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0
      };
    });

    // Create links from prerequisites
    const newLinks = [];
    courses.forEach(course => {
      if (course.prerequisites?.length) {
        course.prerequisites.forEach(prereqId => {
          newLinks.push({
            source: prereqId,
            target: course.id
          });
        });
      }
    });

    setNodes(newNodes);
    setLinks(newLinks);
  }, [courses]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    onCourseSelect?.(node.course);
  };

  const getNodeColor = (course) => {
    if (userProgress[course.id]?.completed) return '#10b981'; // green
    if (userProgress[course.id]?.in_progress) return '#f59e0b'; // amber
    if (course.faculty_id === userFacultyId) return '#8b5cf6'; // purple (recommended)
    return '#64748b'; // slate
  };

  const getNodeStatus = (course) => {
    if (userProgress[course.id]?.completed) return 'Завершён';
    if (userProgress[course.id]?.in_progress) return 'В процессе';
    if (course.faculty_id === userFacultyId) return 'Рекомендован';
    return course.access_type === 'paid' ? 'Платный' : 'Открытый';
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          variant="outline"
          size="icon"
          className="bg-slate-800/80 border-slate-600"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          variant="outline"
          size="icon"
          className="bg-slate-800/80 border-slate-600"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          variant="outline"
          size="icon"
          className="bg-slate-800/80 border-slate-600"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="600"
        className="bg-slate-900/50 rounded-xl border border-slate-700"
        viewBox="0 0 800 600"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="25"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#475569" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Links */}
          {links.map((link, i) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <line
                key={i}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="#475569"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                opacity="0.4"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => handleNodeClick(node)}
              className="cursor-pointer"
            >
              <circle
                r="30"
                fill={getNodeColor(node.course)}
                stroke={selectedNode?.id === node.id ? '#fbbf24' : '#1e293b'}
                strokeWidth={selectedNode?.id === node.id ? '4' : '2'}
                className="transition-all duration-200 hover:stroke-amber-500"
              />
              <text
                textAnchor="middle"
                dy="0.3em"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                pointerEvents="none"
              >
                {node.course.title.slice(0, 1)}
              </text>
              
              {node.course.faculty_id === userFacultyId && (
                <g transform="translate(20, -20)">
                  <circle r="8" fill="#8b5cf6" />
                  <text
                    textAnchor="middle"
                    dy="0.3em"
                    fill="white"
                    fontSize="10"
                  >
                    ★
                  </text>
                </g>
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {[
          { color: '#10b981', label: 'Завершён' },
          { color: '#f59e0b', label: 'В процессе' },
          { color: '#8b5cf6', label: 'Рекомендован' },
          { color: '#64748b', label: 'Доступен' }
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-sm text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Selected Course Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedNode.course.title}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-slate-700 text-slate-300">
                        {selectedNode.course.difficulty}
                      </Badge>
                      <Badge style={{ backgroundColor: getNodeColor(selectedNode.course) }}>
                        {getNodeStatus(selectedNode.course)}
                      </Badge>
                      {selectedNode.course.faculty_id === userFacultyId && (
                        <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Рекомендован для вас
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-slate-300 mb-4">{selectedNode.course.description}</p>
                {selectedNode.course.duration_hours && (
                  <p className="text-slate-400 text-sm">
                    Длительность: {selectedNode.course.duration_hours} часов
                  </p>
                )}
                {selectedNode.course.prerequisites?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-slate-400 text-sm mb-2">Необходимо пройти:</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedNode.course.prerequisites.map(prereqId => {
                        const prereq = courses.find(c => c.id === prereqId);
                        return prereq ? (
                          <Badge key={prereqId} variant="outline" className="border-slate-600">
                            {prereq.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}