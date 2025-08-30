"use client";
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'these-freakin-empanadas';
import MenuTab from './MenuTab';
import CarouselTab from './CarouselTab';
import SettingsTab from './SettingsTab';
import PublishTab from './PublishTab';
import ChangeLogTab from './ChangeLogTab';

export default function AdminClient({ menu, drafts, heroes, settings, changes }: any) {
  const normMenu = menu.map((m: any) => ({
    ...m,
    prices: JSON.parse(m.pricesJson || '{}'),
    orderLinks: JSON.parse(m.orderLinksJson || '{}'),
    tags: JSON.parse(m.tagsJson || '[]')
  }));
  const normDrafts = drafts.map((m: any) => ({
    ...m,
    prices: JSON.parse(m.pricesJson || '{}'),
    orderLinks: JSON.parse(m.orderLinksJson || '{}'),
    tags: JSON.parse(m.tagsJson || '[]')
  }));
  const [tab, setTab] = useState('menu');
  return (
    <Tabs defaultValue={tab}>
      <TabsList>
        <TabsTrigger value="menu" onClick={() => setTab('menu')}>Menu</TabsTrigger>
        <TabsTrigger value="carousel" onClick={() => setTab('carousel')}>Carousel</TabsTrigger>
        <TabsTrigger value="settings" onClick={() => setTab('settings')}>Settings</TabsTrigger>
        <TabsTrigger value="publish" onClick={() => setTab('publish')}>Publishing</TabsTrigger>
        <TabsTrigger value="changelog" onClick={() => setTab('changelog')}>Change Log</TabsTrigger>
      </TabsList>
      <TabsContent value="menu"><MenuTab initialMenu={normMenu} initialDrafts={normDrafts} /></TabsContent>
      <TabsContent value="carousel"><CarouselTab initialHeroes={heroes} /></TabsContent>
      <TabsContent value="settings"><SettingsTab initialSettings={settings} /></TabsContent>
      <TabsContent value="publish"><PublishTab /></TabsContent>
      <TabsContent value="changelog"><ChangeLogTab initialChanges={changes} /></TabsContent>
    </Tabs>
  );
}
