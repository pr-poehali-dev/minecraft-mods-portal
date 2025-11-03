import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Mod {
  id: number;
  name: string;
  description: string;
  category: string;
  downloads: number;
  author: string;
  version: string;
  image: string;
  downloadUrl?: string;
}

const initialMods: Mod[] = [
  {
    id: 1,
    name: 'Diamond Tools Plus',
    description: 'Улучшенные алмазные инструменты с особыми способностями',
    category: 'tools',
    downloads: 15420,
    author: 'CraftMaster',
    version: '1.20.1',
    image: '⛏️'
  },
  {
    id: 2,
    name: 'Dragon Mobs',
    description: 'Добавляет различных драконов в мир Minecraft',
    category: 'mobs',
    downloads: 28350,
    author: 'BeastCreator',
    version: '1.20.1',
    image: '🐉'
  },
  {
    id: 3,
    name: 'Magic Biomes',
    description: 'Новые волшебные биомы с уникальными ресурсами',
    category: 'biomes',
    downloads: 42100,
    author: 'WorldBuilder',
    version: '1.20.1',
    image: '🌳'
  },
  {
    id: 4,
    name: 'Tech Machines',
    description: 'Промышленные машины и автоматизация',
    category: 'tech',
    downloads: 35600,
    author: 'EngineerPro',
    version: '1.20.1',
    image: '⚙️'
  },
  {
    id: 5,
    name: 'Epic Weapons',
    description: 'Легендарное оружие с уникальными эффектами',
    category: 'weapons',
    downloads: 52300,
    author: 'WarriorMod',
    version: '1.20.1',
    image: '⚔️'
  },
  {
    id: 6,
    name: 'Sky Dimensions',
    description: 'Новые измерения в небесах',
    category: 'biomes',
    downloads: 19800,
    author: 'SkyExplorer',
    version: '1.20.1',
    image: '☁️'
  },
  {
    id: 7,
    name: 'Saw',
    description: 'Saw horror mod',
    category: 'tech',
    downloads: 12932,
    author: 'Smaev',
    version: '1.21.1',
    image: '🪚'
  }
];

const categories = [
  { value: 'all', label: 'Все моды', icon: '📦' },
  { value: 'weapons', label: 'Оружие', icon: '⚔️' },
  { value: 'mobs', label: 'Мобы', icon: '🐉' },
  { value: 'biomes', label: 'Биомы', icon: '🌳' },
  { value: 'tech', label: 'Технологии', icon: '⚙️' },
  { value: 'tools', label: 'Инструменты', icon: '⛏️' }
];

export default function Index() {
  const [mods, setMods] = useState<Mod[]>(() => {
    const saved = localStorage.getItem('modFiles');
    return saved ? JSON.parse(saved) : initialMods;
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editModId, setEditModId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [newMod, setNewMod] = useState({
    name: '',
    description: '',
    category: 'tools',
    author: '',
    version: '',
    file: null as File | null
  });

  const filteredMods = mods.filter(mod => {
    const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
    const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMod({ ...newMod, file });
    }
  };

  const handleDownload = (mod: Mod) => {
    if (mod.downloadUrl) {
      const link = document.createElement('a');
      link.href = mod.downloadUrl;
      link.download = `${mod.name}.exe`;
      link.click();
      
      const updatedMods = mods.map(m => 
        m.id === mod.id ? { ...m, downloads: m.downloads + 1 } : m
      );
      setMods(updatedMods);
      
      toast({
        title: "Скачивание",
        description: `Мод "${mod.name}" скачивается...`,
      });
    } else {
      toast({
        title: "Файл не загружен",
        description: "Для этого мода пока нет файла",
        variant: "destructive"
      });
    }
  };

  const handleEditMod = (modId: number) => {
    setEditModId(modId);
  };

  const handleModFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editModId) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = reader.result?.toString().split(',')[1];
        
        try {
          const response = await fetch('https://functions.poehali.dev/f328712b-c446-4560-9833-a6041051cf90', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              fileContent: base64Content,
              modId: editModId.toString()
            })
          });
          
          const result = await response.json();
          
          if (result.uploaded) {
            const updatedMods = mods.map(m => 
              m.id === editModId ? { 
                ...m, 
                downloadUrl: `data:application/octet-stream;base64,${result.fileContent}` 
              } : m
            );
            setMods(updatedMods);
            localStorage.setItem('modFiles', JSON.stringify(updatedMods));
            setEditModId(null);
            
            toast({
              title: "Файл загружен!",
              description: `Файл "${file.name}" сохранён и доступен для скачивания`,
            });
          }
        } catch (error) {
          toast({
            title: "Ошибка загрузки",
            description: "Не удалось загрузить файл на сервер",
            variant: "destructive"
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMod.name || !newMod.description || !newMod.author || !newMod.version) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    const categoryIcon = categories.find(c => c.value === newMod.category)?.icon || '📦';
    
    const mod: Mod = {
      id: mods.length + 1,
      name: newMod.name,
      description: newMod.description,
      category: newMod.category,
      downloads: 0,
      author: newMod.author,
      version: newMod.version,
      image: categoryIcon
    };

    setMods([mod, ...mods]);
    setDialogOpen(false);
    setNewMod({
      name: '',
      description: '',
      category: 'tools',
      author: '',
      version: '',
      file: null
    });

    toast({
      title: "Успешно!",
      description: `Мод "${mod.name}" добавлен в каталог`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky/20 to-grass/20">
      <header className="bg-grass text-white py-6 px-4 pixel-shadow">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎮</div>
              <div>
                <h1 className="text-2xl md:text-3xl leading-tight">Minecraft Mods</h1>
                <p className="text-sm font-normal opacity-90 mt-1">Каталог лучших модификаций</p>
              </div>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-white font-bold pixel-corners pixel-shadow hover-lift">
                  <Icon name="Upload" size={20} className="mr-2" />
                  Загрузить мод
                </Button>
              </DialogTrigger>
              <DialogContent className="pixel-corners max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Загрузить новый мод</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название мода</Label>
                    <Input
                      id="name"
                      value={newMod.name}
                      onChange={(e) => setNewMod({ ...newMod, name: e.target.value })}
                      className="pixel-corners"
                      placeholder="Epic Mod"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={newMod.description}
                      onChange={(e) => setNewMod({ ...newMod, description: e.target.value })}
                      className="pixel-corners"
                      placeholder="Описание вашего мода..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select value={newMod.category} onValueChange={(value) => setNewMod({ ...newMod, category: value })}>
                      <SelectTrigger className="pixel-corners">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="pixel-corners">
                        {categories.slice(1).map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="author">Автор</Label>
                      <Input
                        id="author"
                        value={newMod.author}
                        onChange={(e) => setNewMod({ ...newMod, author: e.target.value })}
                        className="pixel-corners"
                        placeholder="YourName"
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">Версия</Label>
                      <Input
                        id="version"
                        value={newMod.version}
                        onChange={(e) => setNewMod({ ...newMod, version: e.target.value })}
                        className="pixel-corners"
                        placeholder="1.20.1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="file">Файл мода (.jar, .zip, .exe)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".jar,.zip,.exe"
                      onChange={handleFileUpload}
                      className="pixel-corners"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-grass hover:bg-grass/90 pixel-corners pixel-shadow">
                    <Icon name="Upload" size={18} className="mr-2" />
                    Загрузить мод
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск модов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pixel-corners pixel-shadow"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                className={`pixel-corners pixel-shadow hover-lift ${
                  selectedCategory === cat.value 
                    ? 'bg-grass hover:bg-grass/90 text-white' 
                    : 'bg-white hover:bg-muted'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMods.map(mod => (
            <Card key={mod.id} className="pixel-corners pixel-shadow hover-lift overflow-hidden bg-white">
              <div className="bg-gradient-to-br from-sky/30 to-grass/30 p-8 flex items-center justify-center">
                <div className="text-7xl">{mod.image}</div>
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg leading-tight">{mod.name}</h3>
                  <Badge className="pixel-corners bg-secondary shrink-0 text-white">
                    {mod.version}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {mod.description}
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    <Icon name="User" size={14} className="inline mr-1" />
                    {mod.author}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Icon name="Download" size={14} />
                    {mod.downloads.toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleDownload(mod)}
                    className="w-full bg-grass hover:bg-grass/90 text-white pixel-corners pixel-shadow"
                  >
                    <Icon name="Download" size={18} className="mr-2" />
                    Скачать
                  </Button>
                  
                  {mod.id === 7 && (
                    <>
                      <Button 
                        onClick={() => handleEditMod(mod.id)}
                        variant="outline"
                        className="w-full pixel-corners pixel-shadow"
                      >
                        <Icon name="Upload" size={18} className="mr-2" />
                        Загрузить файл (админ)
                      </Button>
                      <input
                        type="file"
                        accept=".exe,.jar,.zip"
                        onChange={handleModFileUpload}
                        style={{ display: editModId === mod.id ? 'block' : 'none' }}
                        className="w-full text-sm"
                      />
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredMods.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Моды не найдены</h3>
            <p className="text-muted-foreground">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        )}
      </div>
    </div>
  );
}