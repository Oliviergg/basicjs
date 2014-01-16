# -*- encoding: utf-8 -*-
require File.expand_path("../lib/basicjs-rails/version", __FILE__)

Gem::Specification.new do |s|
  s.name        = "basicjs-rails"
  s.version     = Basicjs::Rails::VERSION
  s.authors     = ["Olivier Gosse-Gardet"]
  s.email       = ["olivier.gosse.gardet@gmail.com"]
  s.homepage    = ""
  s.summary     = %q{A basic js framework}
  s.description = %q{}
  s.license     = 'MIT'
  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_dependency "thor", "~> 0.14"
  s.add_dependency "jquery-rails", "~> 2.3.0"

  s.add_development_dependency "bundler", "~> 1.0"
  s.add_development_dependency "rails", ">= 3.0"
  s.add_development_dependency "httpclient", "~> 2.2"
end
