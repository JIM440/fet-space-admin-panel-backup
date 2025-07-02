import {
  Dialog,  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import ThemedText from "../typography/ThemedText";

export function ProfileDialog() {
  return (
    <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer w-8 h-8 bg-background-neutral rounded-full">
            {/* <AvatarFallback>JD</AvatarFallback> */}
          </div>
        </DialogTrigger>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 max-h-[70vh] max-w-[90vw] overflow-y-auto">
          {/* <DialogHeader>
            <DialogTitle>Profile Options</DialogTitle>
          </DialogHeader> */}
          {/* content */}
                <div className="container mx-auto p-4">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-gray-200 dark:bg-gray-700 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
              <img
                src="https://via.placeholder.com/100"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <ThemedText variant="h3">
                Njeck Dorothy Ambe
              </ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">FE21A504</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">B.eng Computer Engineering</ThemedText>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-4">
              <ThemedText>Level:</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">200</ThemedText>
            </div>
            <div className="flex gap-4">
              <ThemedText>Gender:</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">Male</ThemedText>
            </div>
            </div>
            <div className="flex gap-4 flex-1">
              <ThemedText>Institutional Email:</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">njeckdorothy@ubuea.cm</ThemedText>
            </div>
            <div className="flex gap-4 flex-1">
              <ThemedText>Alternative Email:</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">njeckdorothy@gmail.com</ThemedText>
            </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="flex gap-4">
              <ThemedText>Nationality:</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">Cameroon</ThemedText>
            </div>
            <div className="flex gap-4">
              <ThemedText>Phone:</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">675829432</ThemedText>
            </div>
          </div>
        </div>
      </div>
          {/* edit profile and settings */}
          <DialogFooter className="space-y-4 fixed top-0 left-4 flex flex-row gap-2 items-center">
            <Link to='/edit-profile' className="w-full">Edit Profile</Link>
            <Link to='/settings'className="w-full">Settings</Link>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
