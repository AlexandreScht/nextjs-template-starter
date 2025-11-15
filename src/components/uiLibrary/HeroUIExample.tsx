"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function HeroUIExample() {
  return (
    <div className="space-y-6">
      <Card className="max-w-2xl">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">HeroUI Components</p>
            <p className="text-small text-default-500">
              Exemples de composants HeroUI
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button color="primary">Primary</Button>
              <Button color="secondary">Secondary</Button>
              <Button color="success">Success</Button>
              <Button color="warning">Warning</Button>
              <Button color="danger">Danger</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Button Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button color="primary" variant="solid">
                Solid
              </Button>
              <Button color="primary" variant="bordered">
                Bordered
              </Button>
              <Button color="primary" variant="light">
                Light
              </Button>
              <Button color="primary" variant="flat">
                Flat
              </Button>
              <Button color="primary" variant="ghost">
                Ghost
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button color="primary" size="sm">
                Small
              </Button>
              <Button color="primary" size="md">
                Medium
              </Button>
              <Button color="primary" size="lg">
                Large
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
