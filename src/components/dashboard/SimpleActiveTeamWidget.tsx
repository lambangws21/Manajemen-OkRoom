// 'use client';
// import { useMemo } from 'react';
// import RoomCard from '@/components/dashboard/RoomCard';
// import { mockRooms } from '@/lib/mock-data';
// import { Filters } from '@/components/dashboard/FilterControls';
// import { motion } from 'framer-motion';


// // Animation variants for the container
// const gridContainerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1 // Make each child appear 0.1s after the previous one
//     }
//   }
// };

// interface RoomGridProps {
//   filters: Filters;
// }

// export default function RoomGrid({ filters }: RoomGridProps) {
//   const filteredRooms = useMemo(() => {
//     return mockRooms.filter(room => {
//       const statusMatch = filters.status === 'All' || room.status === filters.status;
//       const searchMatch = room.number.toString().includes(filters.search);
//       return statusMatch && searchMatch;
//     });
//   }, [filters]);

//   // ...

//   return (
//     // Use motion.div for the grid container
//     <motion.div 
//       className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
//       variants={gridContainerVariants}
//       initial="hidden"
//       animate="visible"
//     >
//       {filteredRooms.map((room) => (
//         // RoomCard now uses its own variants for individual animation
//         <RoomCard key={room.id} room={room} />
//       ))}
//     </motion.div>
//   );
// }