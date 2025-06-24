import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { House } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="w-full h-full">
      <Card className="p-8 mx-auto mt-3">
        <CardContent>
          <Button className="">
            <House />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
