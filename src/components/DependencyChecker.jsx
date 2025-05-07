import React from 'react';
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useSpring } from '@react-spring/three';
import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from '@react-three/postprocessing';
import { create } from 'zustand';

const MotionBox = motion(Box);

export default function DependencyChecker() {
  // Check if all dependencies are loaded successfully
  const dependencies = [
    { name: 'Chakra UI', loaded: typeof Box !== 'undefined' },
    { name: 'Framer Motion', loaded: typeof motion !== 'undefined' },
    { name: 'Monaco Editor', loaded: typeof Editor !== 'undefined' },
    { name: 'React Spring', loaded: typeof useSpring !== 'undefined' },
    { name: 'React Three Drei', loaded: typeof Environment !== 'undefined' },
    { name: 'React Three Fiber', loaded: typeof Canvas !== 'undefined' },
    { name: 'Three.js', loaded: typeof THREE !== 'undefined' },
    { name: 'React Three Postprocessing', loaded: typeof EffectComposer !== 'undefined' },
    { name: 'Zustand', loaded: typeof create !== 'undefined' }
  ];

  return (
    <Box 
      position="fixed"
      top="20px"
      right="20px"
      zIndex={1000}
      bg="rgba(0, 0, 0, 0.8)"
      color="white"
      p={4}
      borderRadius="md"
      boxShadow="lg"
      minWidth="300px"
    >
      <MotionBox 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Text fontSize="lg" fontWeight="bold" mb={2}>Dependency Status</Text>
        <VStack align="stretch" spacing={2}>
          {dependencies.map((dep) => (
            <HStack key={dep.name} justify="space-between">
              <Text>{dep.name}</Text>
              <Badge colorScheme={dep.loaded ? 'green' : 'red'}>
                {dep.loaded ? 'Loaded' : 'Not Loaded'}
              </Badge>
            </HStack>
          ))}
        </VStack>
      </MotionBox>
    </Box>
  );
} 