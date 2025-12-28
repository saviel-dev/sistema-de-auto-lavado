import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { trefoil } from 'ldrs'

interface GlobalLoaderProps {
  isLoading: boolean;
}

export const GlobalLoader = ({ isLoading }: GlobalLoaderProps) => {
  useEffect(() => {
    trefoil.register();
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-6">
            <l-trefoil
              size="70"
              stroke="4"
              stroke-length="0.20"
              bg-opacity="0.3"
              speed="0.9"
              color="#001BB7" 
            ></l-trefoil>
            <p className="text-lg font-medium text-black animate-pulse tracking-wide">
              Cargando...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

